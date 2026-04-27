import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Play, Pause, RotateCcw, Coffee, Brain, Settings2, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type Phase = "focus" | "break";
type Status = "idle" | "running" | "paused";

const PRESETS: { focus: number; brk: number; label: string }[] = [
  { focus: 25, brk: 5, label: "25 / 5" },
  { focus: 50, brk: 10, label: "50 / 10" },
  { focus: 15, brk: 3, label: "15 / 3" },
];

const XP_PER_FOCUS = 15;

const fmt = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const r = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
};

type Persisted = {
  presetIdx: number;
  phase: Phase;
  status: Status;
  endsAt: number | null; // epoch ms when timer should hit 0 (running only)
  secondsLeft: number;   // snapshot for paused state
  completedFocus: number;
  savedAt: number;       // epoch ms — used to detect "stale day" (next-day reset of count)
};

const STORAGE_KEY = "moymoy.focus-timer.v1";

function loadPersisted(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

function savePersisted(p: Persisted) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore quota */
  }
}

function clearPersisted() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function FocusTimer() {
  const { user } = useAuth();

  // Lazy initial state — rehydrate from localStorage so refresh keeps the lock
  const initial = (() => {
    const saved = loadPersisted();
    if (!saved) {
      return {
        presetIdx: 0,
        phase: "focus" as Phase,
        status: "idle" as Status,
        secondsLeft: PRESETS[0].focus * 60,
        completedFocus: 0,
      };
    }
    const p = PRESETS[saved.presetIdx] ?? PRESETS[0];
    const sameDay =
      new Date(saved.savedAt).toDateString() === new Date().toDateString();
    const completedFocus = sameDay ? saved.completedFocus : 0;

    if (saved.status === "running" && saved.endsAt) {
      const remaining = Math.max(0, Math.round((saved.endsAt - Date.now()) / 1000));
      return {
        presetIdx: saved.presetIdx,
        phase: saved.phase,
        status: remaining > 0 ? ("running" as Status) : ("idle" as Status),
        secondsLeft: remaining > 0
          ? remaining
          : (saved.phase === "focus" ? p.focus : p.brk) * 60,
        completedFocus,
      };
    }
    if (saved.status === "paused") {
      return {
        presetIdx: saved.presetIdx,
        phase: saved.phase,
        status: "paused" as Status,
        secondsLeft: saved.secondsLeft,
        completedFocus,
      };
    }
    return {
      presetIdx: saved.presetIdx,
      phase: saved.phase,
      status: "idle" as Status,
      secondsLeft: (saved.phase === "focus" ? p.focus : p.brk) * 60,
      completedFocus,
    };
  })();

  const [presetIdx, setPresetIdx] = useState(initial.presetIdx);
  const preset = PRESETS[presetIdx];

  const [phase, setPhase] = useState<Phase>(initial.phase);
  const [status, setStatus] = useState<Status>(initial.status);
  const [secondsLeft, setSecondsLeft] = useState(initial.secondsLeft);
  const [completedFocus, setCompletedFocus] = useState(initial.completedFocus);
  const [showSettings, setShowSettings] = useState(false);

  // endsAt drives running countdown, so refresh / tab-close keeps wall-clock accurate
  const endsAtRef = useRef<number | null>(
    initial.status === "running" ? Date.now() + initial.secondsLeft * 1000 : null,
  );

  // Reset countdown when preset/phase changes while idle
  useEffect(() => {
    if (status === "idle") {
      setSecondsLeft((phase === "focus" ? preset.focus : preset.brk) * 60);
    }
  }, [presetIdx, phase, preset.focus, preset.brk, status]);

  // Tick — derive from endsAt while running so it stays accurate across refresh
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    if (status !== "running") return;
    if (!endsAtRef.current) {
      endsAtRef.current = Date.now() + secondsLeft * 1000;
    }
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round(((endsAtRef.current ?? Date.now()) - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
    };
    tick();
    tickRef.current = window.setInterval(tick, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist on every meaningful change
  useEffect(() => {
    if (status === "idle" && phase === "focus" && completedFocus === 0) {
      clearPersisted();
      return;
    }
    savePersisted({
      presetIdx,
      phase,
      status,
      endsAt: status === "running" ? endsAtRef.current : null,
      secondsLeft,
      completedFocus,
      savedAt: Date.now(),
    });
  }, [presetIdx, phase, status, secondsLeft, completedFocus]);

  // Phase transitions
  useEffect(() => {
    if (secondsLeft > 0 || status === "idle") return;
    endsAtRef.current = null;
    if (phase === "focus") {
      void completeFocusSession(preset.focus);
      setCompletedFocus((c) => c + 1);
      toast.success(`Focus done — take a ${preset.brk}-min break ☕`, {
        description: `+${XP_PER_FOCUS} XP earned`,
      });
      setPhase("break");
      setStatus("idle");
      setSecondsLeft(preset.brk * 60);
    } else {
      toast("Break over — ready for another round? 💜");
      setPhase("focus");
      setStatus("idle");
      setSecondsLeft(preset.focus * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const completeFocusSession = async (focusMinutes: number) => {
    if (!user) return;
    const duration = focusMinutes * 60;
    const today = todayISO();

    // Log session
    await supabase.from("study_sessions").insert({
      user_id: user.id,
      type: "focus",
      duration_seconds: duration,
      xp_earned: XP_PER_FOCUS,
      session_date: today,
    });

    // Update streak + XP
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_streak,longest_streak,total_xp,last_study_date")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return;

    let nextStreak = profile.current_streak ?? 0;
    if (profile.last_study_date !== today) {
      const gap = profile.last_study_date
        ? daysBetween(profile.last_study_date, today)
        : null;
      nextStreak = gap === 1 ? nextStreak + 1 : 1;
    }
    const nextLongest = Math.max(profile.longest_streak ?? 0, nextStreak);
    const nextXp = (profile.total_xp ?? 0) + XP_PER_FOCUS;

    await supabase
      .from("profiles")
      .update({
        total_xp: nextXp,
        current_streak: nextStreak,
        longest_streak: nextLongest,
        last_study_date: today,
      })
      .eq("id", user.id);
  };

  const totalSeconds = (phase === "focus" ? preset.focus : preset.brk) * 60;
  const progress = useMemo(
    () => 1 - secondsLeft / totalSeconds,
    [secondsLeft, totalSeconds],
  );

  const onStart = () => {
    setStatus("running");
    toast("Locked in 🔒", {
      description: "You can pause, but leaving will end the session.",
    });
  };
  const onPause = () => setStatus("paused");
  const onReset = () => {
    setStatus("idle");
    setSecondsLeft(totalSeconds);
  };

  // "Give up" — reset focus session without reward, ask first
  const onGiveUp = () => {
    if (!confirm("End this focus session early? You won't earn XP for it.")) return;
    setStatus("idle");
    setPhase("focus");
    setSecondsLeft(preset.focus * 60);
    toast("Session ended early — try again when you're ready 💜");
  };

  // Lock the user in while a focus session is running
  const isLocked = status === "running" && phase === "focus";

  // Block in-app navigation
  useBlocker({
    shouldBlockFn: () => {
      if (!isLocked) return false;
      return !confirm(
        "You're in a focus session. Leave anyway? Your progress won't be saved.",
      );
    },
  });

  // Block tab close / refresh / external nav
  useEffect(() => {
    if (!isLocked) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isLocked]);

  // Nudge if the user switches tabs / minimizes
  const awayCountRef = useRef(0);
  useEffect(() => {
    if (!isLocked) return;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        awayCountRef.current += 1;
      } else if (awayCountRef.current > 0) {
        toast.warning("Eyes back here 👀", {
          description: "MoyMoy noticed you stepped away. Stay with the session!",
        });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isLocked]);

  // SVG ring
  const R = 78;
  const C = 2 * Math.PI * R;

  const isFocus = phase === "focus";

  return (
    <div
      className={`rounded-3xl glass-card p-5 shadow-ios-lg relative overflow-hidden transition-shadow ${
        isLocked ? "ring-2 ring-[rgba(151,125,223,0.55)] shadow-cta" : ""
      }`}
    >
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15" />
      <div className="absolute -left-12 -bottom-14 w-36 h-36 rounded-full bg-white/10" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isLocked ? (
              <Lock className="h-4 w-4 text-ink" />
            ) : isFocus ? (
              <Brain className="h-4 w-4 text-ink-soft" />
            ) : (
              <Coffee className="h-4 w-4 text-ink-soft" />
            )}
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink font-semibold">
              {isLocked ? "Locked in" : isFocus ? "Focus" : "Break"} · {preset.label}
            </p>
          </div>
          <button
            onClick={() => !isLocked && setShowSettings((s) => !s)}
            disabled={isLocked}
            className="h-8 w-8 rounded-xl glass grid place-items-center text-ink disabled:opacity-40"
            aria-label="Timer settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>

        {isLocked && (
          <div className="flex items-start gap-2 rounded-2xl bg-white/30 border border-white/40 p-2.5 mb-3">
            <AlertTriangle className="h-4 w-4 text-ink shrink-0 mt-0.5" />
            <p className="text-[11px] text-ink leading-snug">
              Focus mode is on — navigation is blocked. Pause to take a quick break, or end early without XP.
            </p>
          </div>
        )}

        {showSettings && (
          <div className="flex gap-2 mb-4">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => {
                  setPresetIdx(i);
                  setStatus("idle");
                  setPhase("focus");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                  i === presetIdx ? "btn-primary-cta" : "glass text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Ring */}
        <div className="relative mx-auto w-[200px] h-[200px] grid place-items-center mb-4">
          <svg width="200" height="200" className="-rotate-90">
            <circle
              cx="100"
              cy="100"
              r={R}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r={R}
              stroke="url(#moy-ring)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
            <defs>
              <linearGradient id="moy-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F2E6EE" />
                <stop offset="100%" stopColor="#977DDF" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-ink tabular-nums leading-none">
                {fmt(secondsLeft)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft mt-2 font-semibold">
                {status === "running"
                  ? isFocus
                    ? "Stay with it"
                    : "Breathe"
                  : status === "paused"
                  ? "Paused"
                  : isFocus
                  ? "Ready"
                  : "Break time"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {status !== "running" ? (
            <button
              onClick={onStart}
              className="flex-1 inline-flex items-center justify-center gap-2 btn-primary-cta px-4 py-3 text-sm"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              {status === "paused" ? "Resume" : "Start"}
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex-1 inline-flex items-center justify-center gap-2 btn-primary-cta px-4 py-3 text-sm"
            >
              <Pause className="h-4 w-4" fill="currentColor" />
              Pause
            </button>
          )}
          <button
            onClick={onReset}
            disabled={isLocked}
            className="inline-flex items-center justify-center px-4 py-3 rounded-2xl glass text-ink text-sm font-semibold disabled:opacity-40"
            aria-label="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          {phase === "break" ? (
            <button
              onClick={() => {
                setStatus("idle");
                setSecondsLeft(0);
              }}
              className="inline-flex items-center justify-center px-4 py-3 rounded-2xl glass text-ink text-sm font-semibold"
            >
              Skip
            </button>
          ) : (
            status !== "idle" && (
              <button
                onClick={onGiveUp}
                className="inline-flex items-center justify-center px-4 py-3 rounded-2xl glass text-ink text-sm font-semibold"
              >
                End
              </button>
            )
          )}
        </div>

        <div className="flex items-center justify-between mt-4 text-[11px] text-ink-soft">
          <span>Sessions today: <span className="font-bold text-ink">{completedFocus}</span></span>
          <span>+{XP_PER_FOCUS} XP per focus</span>
        </div>
      </div>
    </div>
  );
}

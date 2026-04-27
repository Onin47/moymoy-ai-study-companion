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

export function FocusTimer() {
  const { user } = useAuth();

  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];

  const [phase, setPhase] = useState<Phase>("focus");
  const [status, setStatus] = useState<Status>("idle");
  const [secondsLeft, setSecondsLeft] = useState(preset.focus * 60);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Reset countdown when preset/phase changes while idle
  useEffect(() => {
    if (status === "idle") {
      setSecondsLeft((phase === "focus" ? preset.focus : preset.brk) * 60);
    }
  }, [presetIdx, phase, preset.focus, preset.brk, status]);

  // Tick
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    if (status !== "running") return;
    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [status]);

  // Phase transitions
  useEffect(() => {
    if (secondsLeft > 0 || status === "idle") return;
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
    <div className="rounded-3xl glass-card p-5 shadow-ios-lg relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15" />
      <div className="absolute -left-12 -bottom-14 w-36 h-36 rounded-full bg-white/10" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isFocus ? (
              <Brain className="h-4 w-4 text-ink-soft" />
            ) : (
              <Coffee className="h-4 w-4 text-ink-soft" />
            )}
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft font-semibold">
              {isFocus ? "Focus" : "Break"} · {preset.label}
            </p>
          </div>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="h-8 w-8 rounded-xl glass grid place-items-center text-ink"
            aria-label="Timer settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>

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
            className="inline-flex items-center justify-center px-4 py-3 rounded-2xl glass text-ink text-sm font-semibold"
            aria-label="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onSkip}
            className="inline-flex items-center justify-center px-4 py-3 rounded-2xl glass text-ink text-sm font-semibold"
          >
            Skip
          </button>
        </div>

        <div className="flex items-center justify-between mt-4 text-[11px] text-ink-soft">
          <span>Sessions today: <span className="font-bold text-ink">{completedFocus}</span></span>
          <span>+{XP_PER_FOCUS} XP per focus</span>
        </div>
      </div>
    </div>
  );
}

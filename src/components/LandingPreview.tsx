import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles, Wand2, Check, RotateCw, CalendarDays,
  FileText, Highlighter, MessageCircle, Send, Flame, Trophy, Target,
} from "lucide-react";

export type FeatureKey = "notes" | "ai" | "flashcards" | "chat" | "streak";

type Topic = {
  key: string;
  label: string;
  emoji: string;
  source: string;
  card: { front: string; back: string };
  plan: { day: string; task: string; mins: number }[];
};

const TOPICS: Topic[] = [
  {
    key: "bio", label: "Biology", emoji: "🧬",
    source: "Mitochondria are the powerhouse of the cell, generating ATP through cellular respiration.",
    card: {
      front: "What is the main function of mitochondria?",
      back: "They produce ATP — the cell's energy currency — via cellular respiration.",
    },
    plan: [
      { day: "Mon", task: "Read: Cell structure", mins: 20 },
      { day: "Tue", task: "Flashcards: Organelles", mins: 15 },
      { day: "Wed", task: "Quiz: Respiration", mins: 25 },
    ],
  },
  {
    key: "hist", label: "History", emoji: "🏛️",
    source: "The Renaissance began in 14th century Italy, sparking a revival of art, science, and humanist thought.",
    card: {
      front: "Where and when did the Renaissance begin?",
      back: "In 14th-century Italy — first flourishing in Florence.",
    },
    plan: [
      { day: "Mon", task: "Timeline: 1300–1500", mins: 20 },
      { day: "Tue", task: "Flashcards: Key figures", mins: 15 },
      { day: "Wed", task: "Essay outline", mins: 30 },
    ],
  },
  {
    key: "js", label: "JavaScript", emoji: "⚡",
    source: "A closure is a function that remembers variables from the scope in which it was created.",
    card: {
      front: "What is a closure in JavaScript?",
      back: "A function that retains access to its lexical scope, even when called elsewhere.",
    },
    plan: [
      { day: "Mon", task: "Read: Scope & closures", mins: 20 },
      { day: "Tue", task: "Flashcards: Functions", mins: 15 },
      { day: "Wed", task: "Build: Counter app", mins: 30 },
    ],
  },
];

const FEATURE_META: Record<FeatureKey, { label: string; eyebrow: string; tagline: string }> = {
  notes:      { label: "Smart Notes",   eyebrow: "Notes",      tagline: "Capture once. Highlight what matters." },
  ai:         { label: "AI Generate",   eyebrow: "AI Studio",  tagline: "Turn any note into study material in seconds." },
  flashcards: { label: "Flashcards",    eyebrow: "Recall",     tagline: "Spaced repetition that auto-flips." },
  chat:       { label: "AI Tutor",      eyebrow: "Chat",       tagline: "Ask questions. Get answers from your notes." },
  streak:     { label: "Daily Streak",  eyebrow: "Habits",     tagline: "Show up daily. Watch the streak grow." },
};

export function LandingPreview({ feature = "ai" }: { feature?: FeatureKey }) {
  const [topicIdx, setTopicIdx] = useState(0);
  const topic = TOPICS[topicIdx];
  const meta = FEATURE_META[feature];

  return (
    <section className="w-full mt-2 mb-6 fade-up fade-up-3" aria-label="See MoyMoy in action">
      {/* Header that swaps with the selected feature */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Sparkles className="h-3.5 w-3.5 text-white/70" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/55 font-semibold">
          {meta.eyebrow} · Live preview
        </span>
      </div>

      {/* Topic chips — shared across features */}
      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar -mx-1 px-1">
        {TOPICS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTopicIdx(i)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium border transition-all tap-scale ${
              i === topicIdx
                ? "bg-white text-[#0b0612] border-white shadow-[0_8px_24px_rgba(255,255,255,0.18)]"
                : "bg-white/8 text-white/80 border-white/12 hover:bg-white/12"
            }`}
          >
            <span className="mr-1.5">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Surface — content swaps based on selected feature */}
      <div className="preview-surface rounded-3xl p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        {/* Tagline strip */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[12.5px] text-white/80 font-medium">{meta.tagline}</span>
          <span className="text-[10px] text-white/40">{topic.emoji} {topic.label}</span>
        </div>

        {/* Animated scene per feature — keyed so animations restart on swap */}
        <div key={`${feature}-${topic.key}`} className="feature-stage">
          {feature === "notes"      && <NotesScene topic={topic} />}
          {feature === "ai"         && <AIScene topic={topic} />}
          {feature === "flashcards" && <FlashcardsScene topic={topic} />}
          {feature === "chat"       && <ChatScene topic={topic} />}
          {feature === "streak"     && <StreakScene topic={topic} />}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Scenes ─────────────────────── */

function NotesScene({ topic }: { topic: Topic }) {
  const [typed, setTyped] = useState("");
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    setTyped("");
    let i = 0;
    const text = topic.source;
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      i += 2;
      setTyped(text.slice(0, i));
      if (i >= text.length && tickRef.current) window.clearInterval(tickRef.current);
    }, 22);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [topic.source]);

  return (
    <div className="preview-block rounded-2xl p-3.5 fade-in-soft">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-white/70" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/55 font-semibold">Your note</span>
        </div>
        <span className="text-[10px] text-white/45 inline-flex items-center gap-1">
          <Highlighter className="h-3 w-3" /> auto-highlight
        </span>
      </div>
      <p className="text-[13.5px] leading-relaxed text-white/90 min-h-[3.2em]">
        <HighlightedText text={typed} keywords={["mitochondria", "ATP", "Renaissance", "closure", "Italy", "lexical"]} />
        <span className="type-caret" aria-hidden />
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Stat label="Words"  value={String(typed.split(/\s+/).filter(Boolean).length)} />
        <Stat label="Reading" value={`${Math.max(1, Math.round(typed.length / 220))}m`} />
        <Stat label="Saved"  value="✓" />
      </div>
    </div>
  );
}

function AIScene({ topic }: { topic: Topic }) {
  const [step, setStep] = useState(0); // 0 idle, 1 generating, 2 done
  const [planVisible, setPlanVisible] = useState(0);
  useEffect(() => {
    setStep(0); setPlanVisible(0);
    const t1 = window.setTimeout(() => setStep(1), 250);
    const t2 = window.setTimeout(() => setStep(2), 1500);
    const ts = [0, 1, 2].map((n) =>
      window.setTimeout(() => setPlanVisible((v) => Math.max(v, n + 1)), 1700 + n * 350),
    );
    return () => { clearTimeout(t1); clearTimeout(t2); ts.forEach(clearTimeout); };
  }, [topic.key]);

  const totalMins = useMemo(() => topic.plan.reduce((s, p) => s + p.mins, 0), [topic.plan]);

  return (
    <div className="space-y-3 fade-in-soft">
      <div className="flex items-center gap-2 px-1">
        <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#c9b6ff] to-[#977DDF] shadow-[0_4px_14px_rgba(151,125,223,0.55)]">
          <Wand2 className="h-3 w-3 text-[#0b0612]" strokeWidth={2.5} />
        </div>
        <span className="text-[11px] text-white/70">
          {step === 0 ? "Reading your note…"
            : step === 1 ? "AI is drafting flashcards & a study plan…"
            : "Generated by AI"}
        </span>
        <div className="ml-auto flex gap-1" aria-hidden>
          <span className={`h-1.5 w-1.5 rounded-full bg-white/70 ${step === 1 ? "animate-pulse-soft" : "opacity-30"}`} />
          <span className={`h-1.5 w-1.5 rounded-full bg-white/70 ${step === 1 ? "animate-pulse-soft delay-150" : "opacity-30"}`} />
          <span className={`h-1.5 w-1.5 rounded-full bg-white/70 ${step === 1 ? "animate-pulse-soft delay-300" : "opacity-30"}`} />
        </div>
      </div>

      <div className={`preview-block rounded-2xl p-3.5 transition-all duration-500 ${step >= 2 ? "opacity-100 translate-y-0" : "opacity-50 translate-y-1"}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-white/70" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/55 font-semibold">3-day study plan</span>
          </div>
          <span className="text-[10px] text-white/45">~{totalMins} min total</span>
        </div>
        <ul className="space-y-1.5">
          {topic.plan.map((p, i) => (
            <li
              key={p.day}
              className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 bg-white/[0.04] border border-white/8 transition-all duration-400 ${
                planVisible > i ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
              }`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-white/85">
                {p.day[0]}
              </span>
              <span className="text-[12.5px] text-white/85 flex-1">{p.task}</span>
              <span className="text-[10px] text-white/45">{p.mins}m</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FlashcardsScene({ topic }: { topic: Topic }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    setFlipped(false);
    const a = window.setTimeout(() => setFlipped(true), 1400);
    const b = window.setTimeout(() => setFlipped(false), 3200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [topic.key]);

  return (
    <div className="space-y-3 fade-in-soft">
      <div className="flashcard-scene">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className={`flashcard ${flipped ? "is-flipped" : ""}`}
          aria-label="Flip flashcard"
        >
          <div className="flashcard-face flashcard-front">
            <span className="card-eyebrow">Flashcard · Front</span>
            <p className="card-text">{topic.card.front}</p>
            <span className="card-hint"><RotateCw className="h-3 w-3" /> Tap to flip</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="card-eyebrow">Flashcard · Back</span>
            <p className="card-text">{topic.card.back}</p>
            <span className="card-hint"><Check className="h-3 w-3" /> Got it</span>
          </div>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <Stat label="Deck"   value="12" />
        <Stat label="Due"    value="4" />
        <Stat label="Mastered" value="78%" />
      </div>
    </div>
  );
}

function ChatScene({ topic }: { topic: Topic }) {
  const userMsg = `Explain ${topic.label.toLowerCase()} in one sentence.`;
  const aiMsg   = topic.card.back;
  const [showUser, setShowUser]   = useState(false);
  const [typing,   setTyping]     = useState(false);
  const [aiTyped,  setAiTyped]    = useState("");

  useEffect(() => {
    setShowUser(false); setTyping(false); setAiTyped("");
    const t1 = window.setTimeout(() => setShowUser(true), 250);
    const t2 = window.setTimeout(() => setTyping(true), 900);
    const t3 = window.setTimeout(() => {
      setTyping(false);
      let i = 0;
      const id = window.setInterval(() => {
        i += 2;
        setAiTyped(aiMsg.slice(0, i));
        if (i >= aiMsg.length) window.clearInterval(id);
      }, 22);
    }, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [topic.key, aiMsg]);

  return (
    <div className="space-y-2 fade-in-soft">
      <div className={`flex justify-end transition-all duration-300 ${showUser ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
        <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-white text-[#0b0612] text-[12.5px] font-medium px-3 py-2 shadow-[0_8px_22px_rgba(255,255,255,0.12)]">
          {userMsg}
        </div>
      </div>
      <div className="flex items-start gap-2">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#c9b6ff] to-[#977DDF]">
          <Sparkles className="h-3 w-3 text-[#0b0612]" strokeWidth={2.5} />
        </div>
        <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-white/8 border border-white/10 text-white/90 text-[12.5px] px-3 py-2 min-h-[2.4em]">
          {typing ? (
            <span className="inline-flex gap-1" aria-label="AI is typing">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse-soft" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse-soft delay-150" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse-soft delay-300" />
            </span>
          ) : (
            <>{aiTyped}{aiTyped && aiTyped.length < aiMsg.length && <span className="type-caret" aria-hidden />}</>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 rounded-full bg-white/5 border border-white/10 px-3 py-2">
        <MessageCircle className="h-3.5 w-3.5 text-white/40" />
        <span className="text-[12px] text-white/40 flex-1">Ask anything about your notes…</span>
        <Send className="h-3.5 w-3.5 text-white/60" />
      </div>
    </div>
  );
}

function StreakScene({ topic: _topic }: { topic: Topic }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const completed = [true, true, true, true, true, false, false]; // 5-day streak
  const [filled, setFilled] = useState(0);
  useEffect(() => {
    setFilled(0);
    const ts = completed.map((_, i) =>
      window.setTimeout(() => setFilled((v) => Math.max(v, i + 1)), 200 + i * 140),
    );
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-3 fade-in-soft">
      <div className="preview-block rounded-2xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-[#FF8A4C]" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/55 font-semibold">Current streak</span>
          </div>
          <span className="text-[10px] text-white/45">This week</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-[44px] leading-none font-bold text-white">5</span>
          <span className="text-[12px] text-white/55 pb-2">days in a row</span>
        </div>
        <div className="mt-3 flex justify-between gap-1">
          {days.map((d, i) => {
            const isDone = completed[i] && filled > i;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`h-7 w-full rounded-lg border transition-all duration-300 ${
                    isDone
                      ? "bg-gradient-to-b from-[#FF8A4C] to-[#E25C2A] border-transparent shadow-[0_4px_14px_rgba(255,138,76,0.45)]"
                      : "bg-white/5 border-white/10"
                  }`}
                />
                <span className={`text-[10px] ${isDone ? "text-white" : "text-white/35"}`}>{d}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <Stat label="Best" value="14d" icon={<Trophy className="h-3 w-3" />} />
        <Stat label="Goal" value="20m" icon={<Target className="h-3 w-3" />} />
        <Stat label="XP"   value="1,240" icon={<Sparkles className="h-3 w-3" />} />
      </div>
    </div>
  );
}

/* ─────────────────────── Helpers ─────────────────────── */

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/8 px-2.5 py-2">
      <div className="text-[9.5px] uppercase tracking-[0.16em] text-white/45 font-semibold flex items-center gap-1">
        {icon}{label}
      </div>
      <div className="text-[13px] text-white/90 font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function HighlightedText({ text, keywords }: { text: string; keywords: string[] }) {
  if (!text) return null;
  const re = new RegExp(`(${keywords.map(escapeReg).join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        keywords.some((k) => k.toLowerCase() === p.toLowerCase()) ? (
          <mark key={i} className="bg-[rgba(201,182,255,0.28)] text-white px-1 rounded-md">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function escapeReg(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

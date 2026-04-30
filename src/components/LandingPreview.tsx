import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Wand2, Check, RotateCw, CalendarDays } from "lucide-react";

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
    key: "bio",
    label: "Biology",
    emoji: "🧬",
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
    key: "hist",
    label: "History",
    emoji: "🏛️",
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
    key: "js",
    label: "JavaScript",
    emoji: "⚡",
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

export function LandingPreview() {
  const [topicIdx, setTopicIdx] = useState(0);
  const topic = TOPICS[topicIdx];

  // typing animation for the source note
  const [typed, setTyped] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [planVisible, setPlanVisible] = useState(0);
  const tickRef = useRef<number | null>(null);

  // Reset & re-run the sequence whenever the topic changes
  useEffect(() => {
    setTyped("");
    setShowCard(false);
    setFlipped(false);
    setPlanVisible(0);
    setGenerating(false);

    let i = 0;
    const text = topic.source;
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      i += 2;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        if (tickRef.current) window.clearInterval(tickRef.current);
        // start generating phase
        setGenerating(true);
        window.setTimeout(() => {
          setGenerating(false);
          setShowCard(true);
          // auto-flip preview after a beat
          window.setTimeout(() => setFlipped(true), 1400);
          window.setTimeout(() => setFlipped(false), 3200);
          // reveal plan items one by one
          [0, 1, 2].forEach((n) =>
            window.setTimeout(() => setPlanVisible((v) => Math.max(v, n + 1)), 600 + n * 450),
          );
        }, 900);
      }
    }, 22);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [topicIdx, topic.source]);

  const totalMins = useMemo(() => topic.plan.reduce((s, p) => s + p.mins, 0), [topic.plan]);

  return (
    <section className="w-full mt-2 mb-6 fade-up fade-up-3" aria-label="See MoyMoy in action">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Sparkles className="h-3.5 w-3.5 text-white/70" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/55 font-semibold">
          Live preview
        </span>
      </div>

      {/* Topic chips */}
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

      {/* Preview surface */}
      <div className="preview-surface rounded-3xl p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        {/* Source note */}
        <div className="preview-block rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-semibold">
              Your note
            </span>
            <span className="text-[10px] text-white/40">{topic.emoji} {topic.label}</span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/85 min-h-[3.2em]">
            {typed}
            <span className="type-caret" aria-hidden />
          </p>
        </div>

        {/* AI generating bar */}
        <div className="flex items-center gap-2 my-3 px-1">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#c9b6ff] to-[#977DDF] shadow-[0_4px_14px_rgba(151,125,223,0.55)]">
            <Wand2 className="h-3 w-3 text-[#0b0612]" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] text-white/65">
            {generating ? "AI is creating flashcards & a study plan…" : showCard ? "Generated by AI" : "Waiting for your note…"}
          </span>
          <div className="ml-auto flex gap-1" aria-hidden>
            <span className={`h-1.5 w-1.5 rounded-full bg-white/70 ${generating ? "animate-pulse-soft" : "opacity-30"}`} />
            <span className={`h-1.5 w-1.5 rounded-full bg-white/70 ${generating ? "animate-pulse-soft delay-150" : "opacity-30"}`} />
            <span className={`h-1.5 w-1.5 rounded-full bg-white/70 ${generating ? "animate-pulse-soft delay-300" : "opacity-30"}`} />
          </div>
        </div>

        {/* Generated outputs grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* Flashcard */}
          <div
            className={`flashcard-scene transition-all duration-500 ${
              showCard ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className={`flashcard ${flipped ? "is-flipped" : ""}`}
              aria-label="Flip flashcard"
            >
              <div className="flashcard-face flashcard-front">
                <span className="card-eyebrow">Flashcard · Front</span>
                <p className="card-text">{topic.card.front}</p>
                <span className="card-hint">
                  <RotateCw className="h-3 w-3" /> Tap to flip
                </span>
              </div>
              <div className="flashcard-face flashcard-back">
                <span className="card-eyebrow">Flashcard · Back</span>
                <p className="card-text">{topic.card.back}</p>
                <span className="card-hint">
                  <Check className="h-3 w-3" /> Got it
                </span>
              </div>
            </button>
          </div>

          {/* Study plan */}
          <div
            className={`preview-block rounded-2xl p-3.5 transition-all duration-500 ${
              showCard ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-white/70" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/55 font-semibold">
                  3-day study plan
                </span>
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
      </div>
    </section>
  );
}

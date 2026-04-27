import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Brain, Layers, FileQuestion, Sparkles, Target, Zap, Timer } from "lucide-react";
import { FocusTimer } from "@/components/FocusTimer";

export const Route = createFileRoute("/_app/study")({
  component: StudyPage,
});

type Deck = { id: string; title: string; card_count: number; subject: string | null };
type Quiz = { id: string; title: string; question_count: number; modes: string[] };

function StudyPage() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("decks")
      .select("id,title,card_count,subject")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setDecks(data ?? []));
    supabase
      .from("quizzes")
      .select("id,title,question_count,modes")
      .order("created_at", { ascending: false })
      .then(({ data }) => setQuizzes(data ?? []));
  }, [user]);

  const featured = decks[0];
  const totalCards = decks.reduce((s, d) => s + (d.card_count ?? 0), 0);

  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-5 fade-up fade-up-1">
        <h1 className="text-3xl font-bold text-ink">Study</h1>
        <p className="text-xs text-ink-soft/80 italic">Soft focus. Sharp recall.</p>
      </div>

      {/* Focus card */}
      <div className="rounded-3xl glass-card p-5 shadow-ios-lg mb-5 relative overflow-hidden fade-up fade-up-2">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/20" />
        <div className="absolute -left-10 -bottom-12 w-32 h-32 rounded-full bg-white/15" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-ink-soft" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft font-semibold">
              Today's focus
            </p>
          </div>
          {featured ? (
            <>
              <p className="text-xl font-bold text-ink leading-tight mb-1">{featured.title}</p>
              <p className="text-xs text-ink-soft/85 mb-4">
                {featured.card_count} cards · ready when you are
              </p>
              <div className="flex gap-2">
                <Link
                  to="/decks/$deckId"
                  params={{ deckId: featured.id }}
                  className="flex-1 inline-flex items-center justify-center gap-2 btn-primary-cta px-4 py-3 text-sm"
                >
                  <Zap className="h-4 w-4" />
                  Start session
                </Link>
                <Link
                  to="/library"
                  className="inline-flex items-center justify-center px-4 py-3 rounded-2xl glass text-ink text-sm font-semibold"
                >
                  Switch
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-ink leading-tight mb-1">No deck queued yet</p>
              <p className="text-xs text-ink-soft/85 mb-4">
                Generate a deck from any note to start studying.
              </p>
              <Link
                to="/library"
                className="inline-flex items-center justify-center gap-2 btn-primary-cta px-4 py-3 text-sm w-full"
              >
                <Sparkles className="h-4 w-4" />
                Open Library
              </Link>
            </>
          )}
        </div>
      </div>


      {/* Focus timer */}
      <div className="mb-5 fade-up fade-up-3">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Timer className="h-4 w-4 text-ink" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
            Focus timer
          </h2>
          <div className="h-px flex-1 ml-1 moy-divider" />
        </div>
        <FocusTimer />
      </div>

      {/* Study controls */}
      <div className="grid grid-cols-3 gap-3 mb-6 fade-up fade-up-4">
        <ControlCard icon={Layers} label="Flashcards" sub={`${decks.length} decks`} />
        <ControlCard icon={FileQuestion} label="Quizzes" sub={`${quizzes.length} sets`} />
        <ControlCard icon={Brain} label="Cards" sub={`${totalCards} total`} />
      </div>

      {/* Decks */}
      <section className="mb-6 fade-up fade-up-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-ink" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
              Flashcard decks
            </h2>
          </div>
          <div className="h-px flex-1 ml-3 moy-divider" />
        </div>
        {decks.length === 0 ? (
          <div className="rounded-2xl glass-card p-5 text-center">
            <p className="text-sm text-ink-soft">No decks yet. Generate one from a note.</p>
            <Link
              to="/library"
              className="inline-block mt-3 text-sm font-semibold text-ink underline-offset-4 hover:underline"
            >
              Open Library →
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {decks.map((d) => (
              <Link
                key={d.id}
                to="/decks/$deckId"
                params={{ deckId: d.id }}
                className="flex items-center gap-3 rounded-2xl glass-card p-3.5"
              >
                <div className="h-11 w-11 rounded-xl bg-brand-gradient-reverse grid place-items-center shrink-0 shadow-cta">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-ink">{d.title}</p>
                  <p className="text-xs text-ink-soft/80">{d.card_count} cards</p>
                </div>
                <span className="text-xs font-semibold text-ink">Study →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quizzes */}
      <section className="fade-up fade-up-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-ink" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
              Quizzes
            </h2>
          </div>
          <div className="h-px flex-1 ml-3 moy-divider" />
        </div>
        {quizzes.length === 0 ? (
          <div className="rounded-2xl glass-card p-5 text-center">
            <p className="text-sm text-ink-soft">
              No quizzes yet. Open a note and tap "Generate quiz".
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {quizzes.map((q) => (
              <Link
                key={q.id}
                to="/quizzes/$quizId"
                params={{ quizId: q.id }}
                className="flex items-center gap-3 rounded-2xl glass-card p-3.5"
              >
                <div className="h-11 w-11 rounded-xl bg-brand-gradient-reverse grid place-items-center shrink-0 shadow-cta">
                  <FileQuestion className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-ink">{q.title}</p>
                  <p className="text-xs text-ink-soft/80">
                    {q.question_count} questions · {q.modes.length} mode
                    {q.modes.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-xs font-semibold text-ink">Take →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ControlCard({
  icon: Icon,
  label,
  sub,
}: {
  icon: typeof Brain;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl glass-card p-3 flex flex-col items-start gap-2">
      <div className="h-9 w-9 rounded-xl bg-brand-gradient-reverse grid place-items-center shadow-cta">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-ink leading-tight">{label}</p>
        <p className="text-[10px] text-ink-soft/80 leading-tight">{sub}</p>
      </div>
    </div>
  );
}

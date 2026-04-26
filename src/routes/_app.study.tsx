import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Brain, Layers, FileQuestion } from "lucide-react";

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

  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-1">Study</h1>
      <p className="text-sm text-muted-foreground mb-5">Pick a deck or quiz to begin 🧠</p>

      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Flashcard decks</h2>
        </div>
        {decks.length === 0 ? (
          <div className="rounded-2xl bg-brand-soft p-5 text-center">
            <p className="text-sm text-muted-foreground">No decks yet. Generate one from a note.</p>
            <Link to="/library" className="inline-block mt-3 text-sm font-semibold text-primary">
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
                className="flex items-center gap-3 rounded-2xl bg-card shadow-ios-sm p-3.5 tap-scale"
              >
                <div className="h-11 w-11 rounded-xl bg-brand-gradient grid place-items-center shrink-0">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.card_count} cards</p>
                </div>
                <span className="text-xs font-semibold text-primary">Study →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <FileQuestion className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Quizzes</h2>
        </div>
        {quizzes.length === 0 ? (
          <div className="rounded-2xl bg-brand-soft p-5 text-center">
            <p className="text-sm text-muted-foreground">
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
                className="flex items-center gap-3 rounded-2xl bg-card shadow-ios-sm p-3.5 tap-scale"
              >
                <div className="h-11 w-11 rounded-xl bg-amber-100 grid place-items-center shrink-0">
                  <FileQuestion className="h-5 w-5 text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{q.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.question_count} questions · {q.modes.length} mode{q.modes.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary">Take →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

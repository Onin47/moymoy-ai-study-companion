import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Plus, FileText, Layers, Search } from "lucide-react";

export const Route = createFileRoute("/_app/library")({
  component: LibraryPage,
});

type Note = { id: string; title: string; subject: string | null; updated_at: string };
type Deck = { id: string; title: string; subject: string | null; card_count: number; updated_at: string };

function LibraryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"notes" | "decks">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notes")
      .select("id,title,subject,updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setNotes(data ?? []));
    supabase
      .from("decks")
      .select("id,title,subject,card_count,updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setDecks(data ?? []));
  }, [user]);

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(q.toLowerCase()));
  const filteredDecks = decks.filter(d => d.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4 fade-up fade-up-1">
        <div>
          <h1 className="text-3xl font-bold text-ink">Library</h1>
          <p className="text-xs text-ink-soft/80 italic">Your notes & decks, in one calm place.</p>
        </div>
        <Link
          to="/notes/new"
          className="h-11 w-11 rounded-2xl btn-primary-cta grid place-items-center"
          aria-label="New note"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl glass-card px-4 py-2.5 mb-4 fade-up fade-up-2">
        <Search className="h-4 w-4 text-ink-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notes & decks"
          className="input-glow flex-1 bg-transparent text-sm outline-none placeholder:text-ink-soft/60 text-ink rounded-md px-1 py-1"
        />
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl glass-card p-1 mb-4 fade-up fade-up-3">
        {(["notes", "decks"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition ${
              tab === t ? "btn-primary-cta" : "text-ink-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "notes" ? (
        filteredNotes.length === 0 ? (
          <Empty
            icon={FileText}
            title="No notes yet"
            subtitle="Tap + to add your first study note"
            ctaTo="/notes/new"
            ctaLabel="Add a note"
          />
        ) : (
          <div className="space-y-3 fade-up fade-up-4">
            {filteredNotes.map((n) => (
              <Link
                key={n.id}
                to="/notes/$noteId"
                params={{ noteId: n.id }}
                className="block rounded-2xl glass-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-gradient-reverse grid place-items-center shrink-0 shadow-cta">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate text-ink">{n.title}</p>
                    {n.subject && (
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/40 text-ink-soft">
                        {n.subject}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : filteredDecks.length === 0 ? (
        <Empty
          icon={Layers}
          title="No decks yet"
          subtitle="Generate flashcards from any of your notes"
          ctaTo="/library"
          ctaLabel="Browse notes"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 fade-up fade-up-4">
          {filteredDecks.map((d) => (
            <Link
              key={d.id}
              to="/decks/$deckId"
              params={{ deckId: d.id }}
              className="rounded-2xl glass-card p-4 aspect-square flex flex-col justify-between"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-gradient-reverse grid place-items-center shadow-cta">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm line-clamp-2 text-ink">{d.title}</p>
                <p className="text-xs text-ink-soft/80 mt-1">{d.card_count} cards</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({
  icon: Icon, title, subtitle, ctaTo, ctaLabel,
}: {
  icon: typeof FileText;
  title: string;
  subtitle: string;
  ctaTo: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-3xl glass-card p-8 text-center fade-up fade-up-4">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-gradient-reverse grid place-items-center mb-3 shadow-cta">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <p className="font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-soft/85 mt-1 mb-4">{subtitle}</p>
      <Link
        to={ctaTo}
        className="inline-flex items-center justify-center btn-primary-cta px-5 py-2.5 text-sm"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

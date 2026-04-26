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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Library</h1>
        <Link
          to="/notes/new"
          className="h-10 w-10 rounded-full bg-brand-gradient grid place-items-center shadow-ios tap-scale"
          aria-label="New note"
        >
          <Plus className="h-5 w-5 text-white" />
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notes & decks"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-muted p-1 mb-4">
        {(["notes", "decks"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition ${
              tab === t ? "bg-card shadow-ios-sm text-foreground" : "text-muted-foreground"
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
          <div className="space-y-3">
            {filteredNotes.map((n) => (
              <Link
                key={n.id}
                to="/notes/$noteId"
                params={{ noteId: n.id }}
                className="block rounded-2xl bg-card shadow-ios-sm p-4 tap-scale"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-soft grid place-items-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{n.title}</p>
                    {n.subject && (
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
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
        <div className="grid grid-cols-2 gap-3">
          {filteredDecks.map((d) => (
            <Link
              key={d.id}
              to="/decks/$deckId"
              params={{ deckId: d.id }}
              className="rounded-2xl bg-card shadow-ios-sm p-4 tap-scale aspect-square flex flex-col justify-between"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-gradient grid place-items-center">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm line-clamp-2">{d.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.card_count} cards</p>
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
    <div className="rounded-3xl bg-brand-soft p-8 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-white/70 grid place-items-center mb-3">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{subtitle}</p>
      <Link
        to={ctaTo}
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-ios tap-scale"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

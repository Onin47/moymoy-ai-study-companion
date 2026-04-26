import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Sparkles, Layers, FileQuestion, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_app/notes/$noteId")({
  component: NoteDetailPage,
});

type Note = { id: string; title: string; subject: string | null; content: string };

function NoteDetailPage() {
  const { noteId } = Route.useParams();
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    supabase
      .from("notes")
      .select("id,title,subject,content")
      .eq("id", noteId)
      .maybeSingle()
      .then(({ data }) => setNote(data));
  }, [noteId]);

  if (!note) {
    return (
      <div className="px-5 pt-6 max-w-md mx-auto">
        <Link to="/library" className="flex items-center gap-1 text-primary mb-4">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Library</span>
        </Link>
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      <Link to="/library" className="flex items-center gap-1 text-primary mb-4 tap-scale">
        <ChevronLeft className="h-5 w-5" />
        <span className="text-sm font-semibold">Library</span>
      </Link>

      {note.subject && (
        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground mb-2">
          {note.subject}
        </span>
      )}
      <h1 className="text-3xl font-bold mb-4">{note.title}</h1>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <ActionCard icon={Sparkles} label="Summarize" tint="bg-primary-soft" iconColor="text-primary" />
        <ActionCard icon={Layers} label="Flashcards" tint="bg-amber-100" iconColor="text-amber-700" />
        <ActionCard icon={FileQuestion} label="Quiz" tint="bg-emerald-100" iconColor="text-emerald-700" />
        <ActionCard icon={MessageCircle} label="Ask AI" tint="bg-sky-100" iconColor="text-sky-700" />
      </div>

      <div className="rounded-2xl bg-card shadow-ios-sm p-4 whitespace-pre-wrap text-sm leading-relaxed">
        {note.content || <span className="text-muted-foreground">No content.</span>}
      </div>

      <p className="text-xs text-center text-muted-foreground mt-6 mb-2">
        AI generation tools land in the next update ✨
      </p>
    </div>
  );
}

function ActionCard({
  icon: Icon, label, tint, iconColor,
}: {
  icon: typeof Sparkles;
  label: string;
  tint: string;
  iconColor: string;
}) {
  return (
    <button
      type="button"
      className="rounded-2xl bg-card shadow-ios-sm p-3.5 tap-scale flex flex-col gap-2 text-left"
    >
      <div className={`h-9 w-9 rounded-xl ${tint} grid place-items-center`}>
        <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notes/new")({
  component: NewNotePage,
});

function NewNotePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    if (!user || !title.trim()) {
      toast.error("Add a title first");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title: title.trim(),
        subject: subject.trim() || null,
        content,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Note saved 💜");
    navigate({ to: "/notes/$noteId", params: { noteId: data.id } });
  };

  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/library" className="flex items-center gap-1 text-primary tap-scale">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Library</span>
        </Link>
        <button
          onClick={onSave}
          disabled={busy}
          className="rounded-full bg-brand-gradient text-white text-sm font-semibold px-4 py-2 shadow-ios tap-scale disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-4">New note</h1>

      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-2xl bg-card shadow-ios-sm px-4 py-3 text-lg font-semibold outline-none focus:ring-2 focus:ring-primary/40"
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (optional)"
          className="w-full rounded-2xl bg-card shadow-ios-sm px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type your study material here…"
          rows={14}
          className="w-full rounded-2xl bg-card shadow-ios-sm px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>
    </div>
  );
}

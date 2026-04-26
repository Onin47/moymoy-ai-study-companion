import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-1">AI Tutor</h1>
      <p className="text-sm text-muted-foreground mb-6">Ask anything about your studies ✨</p>

      <div className="rounded-3xl bg-brand-gradient p-6 text-white shadow-ios-lg mb-5 relative overflow-hidden">
        <Sparkles className="absolute top-3 right-3 h-6 w-6 text-white/40" />
        <MessageCircle className="h-10 w-10 mb-3" />
        <h2 className="text-xl font-bold">Coming next</h2>
        <p className="text-sm text-white/90 mt-1">
          A streaming AI chat is wired up next — it'll be able to read your notes and quiz you on demand.
        </p>
      </div>

      <div className="space-y-2.5">
        <SuggestedPrompt text="Explain a concept like I'm 12" />
        <SuggestedPrompt text="Quiz me on my latest note" />
        <SuggestedPrompt text="Make me a study plan for this week" />
      </div>
    </div>
  );
}

function SuggestedPrompt({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="w-full text-left rounded-2xl bg-card shadow-ios-sm p-4 tap-scale flex items-center gap-3"
    >
      <Sparkles className="h-4 w-4 text-primary shrink-0" />
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}

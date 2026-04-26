import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_app/decks/$deckId")({
  component: DeckDetailPage,
});

function DeckDetailPage() {
  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      <Link to="/library" className="flex items-center gap-1 text-primary mb-4 tap-scale">
        <ChevronLeft className="h-5 w-5" />
        <span className="text-sm font-semibold">Library</span>
      </Link>
      <h1 className="text-3xl font-bold mb-2">Deck</h1>
      <div className="rounded-2xl bg-brand-soft p-6 text-center">
        <p className="text-sm text-muted-foreground">Flashcard study mode coming next ✨</p>
      </div>
    </div>
  );
}

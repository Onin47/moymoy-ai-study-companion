import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_app/quizzes/$quizId")({
  component: QuizDetailPage,
});

function QuizDetailPage() {
  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      <Link to="/study" className="flex items-center gap-1 text-primary mb-4 tap-scale">
        <ChevronLeft className="h-5 w-5" />
        <span className="text-sm font-semibold">Study</span>
      </Link>
      <h1 className="text-3xl font-bold mb-2">Quiz</h1>
      <div className="rounded-2xl bg-brand-soft p-6 text-center">
        <p className="text-sm text-muted-foreground">Quiz mode (MC, identification, MTF, enumeration) coming next ✨</p>
      </div>
    </div>
  );
}

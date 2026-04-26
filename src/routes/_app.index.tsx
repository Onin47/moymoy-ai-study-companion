import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Flame, Sparkles, Plus, BookOpen, Brain, MessageCircle, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

type Profile = {
  display_name: string | null;
  current_streak: number;
  total_xp: number;
};

const xpForLevel = (lvl: number) => lvl * 100;
const levelFromXp = (xp: number) => Math.max(1, Math.floor(xp / 100) + 1);

function HomePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentDeck, setRecentDeck] = useState<{ id: string; title: string; card_count: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name,current_streak,total_xp")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));

    supabase
      .from("decks")
      .select("id,title,card_count")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setRecentDeck(data));
  }, [user]);

  const name = profile?.display_name?.split(" ")[0] ?? "friend";
  const xp = profile?.total_xp ?? 0;
  const streak = profile?.current_streak ?? 0;
  const level = levelFromXp(xp);
  const xpInLevel = xp % 100;
  const progress = (xpInLevel / 100) * 100;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-5 pt-6 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-3xl font-bold capitalize">{name} 👋</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-flame-gradient text-white shadow-ios-sm">
          <Flame className="h-4 w-4 animate-flame" fill="currentColor" />
          <span className="font-bold text-sm">{streak}</span>
        </div>
      </div>

      {/* XP card */}
      <div className="rounded-3xl bg-brand-gradient p-5 text-white shadow-ios-lg mb-5 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-12 top-10 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/80 font-semibold">Level {level}</p>
              <p className="text-2xl font-bold mt-0.5">{xp} XP</p>
            </div>
            <Sparkles className="h-8 w-8 text-white/80" />
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/80 mt-1.5">
            {100 - xpInLevel} XP to level {level + 1}
          </p>
        </div>
      </div>

      {/* Continue studying */}
      {recentDeck ? (
        <Link
          to="/study"
          className="block rounded-2xl bg-card shadow-ios p-4 mb-5 tap-scale"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary-soft grid place-items-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Continue</p>
              <p className="font-semibold truncate">{recentDeck.title}</p>
              <p className="text-xs text-muted-foreground">{recentDeck.card_count} cards</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Link>
      ) : (
        <Link
          to="/library"
          className="block rounded-2xl bg-brand-soft border-2 border-dashed border-primary/30 p-5 mb-5 tap-scale text-center"
        >
          <div className="mx-auto h-12 w-12 rounded-2xl bg-white/70 grid place-items-center mb-2">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <p className="font-semibold">Add your first note</p>
          <p className="text-xs text-muted-foreground mt-1">Paste your study material to get started</p>
        </Link>
      )}

      {/* Quick actions */}
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">
        Quick actions
      </p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <QuickAction to="/library" icon={Plus} label="New note" tint="bg-primary-soft" iconColor="text-primary" />
        <QuickAction to="/library" icon={BookOpen} label="My library" tint="bg-amber-100" iconColor="text-amber-700" />
        <QuickAction to="/study" icon={Brain} label="Study" tint="bg-emerald-100" iconColor="text-emerald-700" />
        <QuickAction to="/chat" icon={MessageCircle} label="Ask AI" tint="bg-sky-100" iconColor="text-sky-700" />
      </div>

      {/* Daily reminder */}
      <div className="rounded-2xl bg-card shadow-ios-sm p-4 border border-border">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <p className="font-semibold text-sm">Tip of the day</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Even 5 minutes of review beats cramming. Open a deck and warm up your brain ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  to, icon: Icon, label, tint, iconColor,
}: {
  to: string;
  icon: typeof Plus;
  label: string;
  tint: string;
  iconColor: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl bg-card shadow-ios-sm p-4 tap-scale flex flex-col gap-2"
    >
      <div className={`h-10 w-10 rounded-xl ${tint} grid place-items-center`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

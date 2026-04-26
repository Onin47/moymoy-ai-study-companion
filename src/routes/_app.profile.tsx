import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { LogOut, Flame, Sparkles, Trophy, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

type Profile = {
  display_name: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  reminder_time: string | null;
  reminder_enabled: boolean;
};

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name,avatar_url,current_streak,longest_streak,total_xp,reminder_time,reminder_enabled")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setP(data));
  }, [user]);

  const onSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const initial = (p?.display_name ?? user?.email ?? "M").charAt(0).toUpperCase();
  const level = Math.max(1, Math.floor((p?.total_xp ?? 0) / 100) + 1);

  return (
    <div className="px-5 pt-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-5">Profile</h1>

      <div className="rounded-3xl bg-card shadow-ios p-6 text-center mb-4">
        <div className="mx-auto h-20 w-20 rounded-full bg-brand-gradient grid place-items-center text-white text-3xl font-bold shadow-ios">
          {initial}
        </div>
        <p className="mt-3 text-xl font-bold">{p?.display_name ?? "MoyMoy user"}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Level {level}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <Stat icon={<Flame className="h-5 w-5" />} value={p?.current_streak ?? 0} label="Streak" tint="bg-flame-gradient text-white" />
        <Stat icon={<Trophy className="h-5 w-5" />} value={p?.longest_streak ?? 0} label="Best" tint="bg-amber-100 text-amber-700" />
        <Stat icon={<Sparkles className="h-5 w-5" />} value={p?.total_xp ?? 0} label="XP" tint="bg-primary-soft text-primary" />
      </div>

      <div className="rounded-2xl bg-card shadow-ios-sm p-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-soft grid place-items-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Daily reminder</p>
            <p className="text-xs text-muted-foreground">
              {p?.reminder_enabled ? `On at ${(p.reminder_time ?? "19:00").slice(0,5)}` : "Off"}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onSignOut}
        className="w-full rounded-2xl bg-card shadow-ios-sm p-4 tap-scale flex items-center gap-3 text-destructive"
      >
        <div className="h-10 w-10 rounded-xl bg-destructive/10 grid place-items-center">
          <LogOut className="h-5 w-5" />
        </div>
        <span className="font-semibold text-sm">Sign out</span>
      </button>
    </div>
  );
}

function Stat({
  icon, value, label, tint,
}: { icon: React.ReactNode; value: number; label: string; tint: string }) {
  return (
    <div className="rounded-2xl bg-card shadow-ios-sm p-3 text-center">
      <div className={`mx-auto h-10 w-10 rounded-xl grid place-items-center mb-1 ${tint}`}>
        {icon}
      </div>
      <p className="font-bold text-lg leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
    </div>
  );
}

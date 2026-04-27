import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Brain, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tab = { to: string; label: string; icon: typeof Home; exact?: boolean };
const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/study", label: "Study", icon: Brain },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="relative min-h-screen">
      <main className="pb-28 safe-top">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="mx-auto max-w-md px-3 pb-2">
          <div className="glass-strong rounded-3xl shadow-ios-lg px-2 py-2 flex justify-between">
            {tabs.map((t) => {
              const active = t.exact
                ? pathname === t.to
                : pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl tap-scale transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-transform",
                      active && "scale-110"
                    )}
                    strokeWidth={active ? 2.4 : 2}
                    fill={active ? "currentColor" : "none"}
                    fillOpacity={active ? 0.15 : 0}
                  />
                  <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                    {t.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Brain, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

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

  // Re-trigger the route-in animation on every pathname change
  const [animKey, setAnimKey] = useState(pathname);
  useEffect(() => {
    setAnimKey(pathname);
  }, [pathname]);

  // Animated tab indicator — measures the active tab's position
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const activeIndex = tabs.findIndex((t) =>
    t.exact ? pathname === t.to : pathname.startsWith(t.to),
  );

  useLayoutEffect(() => {
    const el = tabRefs.current[activeIndex];
    const parent = navRef.current;
    if (!el || !parent) return;
    const elRect = el.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    setPill({ left: elRect.left - parentRect.left, width: elRect.width });
  }, [activeIndex, pathname]);

  return (
    <div className="relative min-h-screen">
      <main key={animKey} className="pb-28 safe-top animate-route-in">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="mx-auto max-w-md px-3 pb-2">
          <div
            ref={navRef}
            className="glass-strong rounded-3xl shadow-ios-lg px-2 py-2 flex justify-between relative"
          >
            {pill && (
              <span
                className="tab-indicator"
                style={{ left: pill.left, width: pill.width }}
                aria-hidden
              />
            )}
            {tabs.map((t, i) => {
              const active = i === activeIndex;
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  className={cn(
                    "relative z-10 flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl tap-scale transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-all duration-300",
                      active && "scale-110 -translate-y-0.5 drop-shadow-[0_4px_8px_rgba(151,125,223,0.5)]",
                    )}
                    strokeWidth={active ? 2.4 : 2}
                    fill={active ? "currentColor" : "none"}
                    fillOpacity={active ? 0.15 : 0}
                  />
                  <span className={cn("text-[10px] font-medium transition-all", active && "font-semibold")}>
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

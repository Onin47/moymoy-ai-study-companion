import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, BookOpen, Brain, MessageCircle, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { isSwipeLocked, onSwipeLockChange } from "@/lib/swipe-lock";

type Tab = { to: string; label: string; icon: typeof Home; exact?: boolean };
const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/study", label: "Study", icon: Brain },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
];

const SWIPE_THRESHOLD_PX = 70;
const SWIPE_VELOCITY_TRIGGER = 0.45; // px / ms
const HORIZONTAL_DOMINANCE = 1.3;

function vibrate(ms: number) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }).vibrate?.(ms);
    } catch {
      /* ignore */
    }
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Track the global swipe-lock (focus session) so we can disable gestures
  const [swipeLocked, setSwipeLockedState] = useState(false);
  useEffect(() => {
    setSwipeLockedState(isSwipeLocked());
    return onSwipeLockChange(setSwipeLockedState);
  }, []);

  const activeIndex = tabs.findIndex((t) =>
    t.exact ? pathname === t.to : pathname.startsWith(t.to),
  );

  // Direction of last navigation: +1 = moved right (next tab), -1 = left
  const [enterDir, setEnterDir] = useState<1 | -1 | 0>(0);
  const prevIndexRef = useRef(activeIndex);
  useEffect(() => {
    const prev = prevIndexRef.current;
    if (prev !== activeIndex && prev !== -1 && activeIndex !== -1) {
      setEnterDir(activeIndex > prev ? 1 : -1);
    }
    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Re-trigger the route-in animation on every pathname change
  const [animKey, setAnimKey] = useState(pathname);
  useEffect(() => setAnimKey(pathname), [pathname]);

  // Animated tab indicator — measures the active tab's position
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = tabRefs.current[activeIndex];
    const parent = navRef.current;
    if (!el || !parent) return;
    const elRect = el.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    setPill({ left: elRect.left - parentRect.left, width: elRect.width });
  }, [activeIndex, pathname]);

  const pulseIndicator = useCallback(() => {
    const el = indicatorRef.current;
    if (!el) return;
    el.classList.remove("haptic");
    // force reflow so the animation can replay
    void el.offsetWidth;
    el.classList.add("haptic");
  }, []);

  // ===== Swipe state =====
  const swipeRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    pointerId: number;
    active: boolean;       // committed to horizontal gesture
    width: number;
  } | null>(null);
  const [dragDx, setDragDx] = useState(0);
  const [snapping, setSnapping] = useState(false);

  const canSwipeLeft = activeIndex < tabs.length - 1; // → next
  const canSwipeRight = activeIndex > 0;              // → prev

  const goToIndex = useCallback(
    (idx: number, dir: 1 | -1) => {
      const target = tabs[idx];
      if (!target) return;
      vibrate(10);
      pulseIndicator();
      setEnterDir(dir);
      navigate({ to: target.to });
    },
    [navigate, pulseIndicator],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeLocked) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Skip if user starts on something that scrolls horizontally or is interactive in a way that conflicts
    const target = e.target as HTMLElement;
    if (target.closest("[data-no-swipe]")) return;
    const el = swipeRef.current;
    if (!el) return;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: performance.now(),
      pointerId: e.pointerId,
      active: false,
      width: el.getBoundingClientRect().width,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.active) {
      // Decide if this is a horizontal swipe
      if (Math.abs(dx) < 8) return;
      if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_DOMINANCE) {
        // Vertical scroll wins — abandon
        dragState.current = null;
        return;
      }
      s.active = true;
      setSnapping(false);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    // Rubber-band at edges
    let applied = dx;
    if ((dx > 0 && !canSwipeRight) || (dx < 0 && !canSwipeLeft)) {
      applied = dx * 0.25;
    }
    // Cap so it never feels broken
    const cap = s.width * 0.6;
    applied = Math.max(-cap, Math.min(cap, applied));
    setDragDx(applied);
  };

  const finishDrag = (dx: number, durationMs: number) => {
    const velocity = Math.abs(dx) / Math.max(durationMs, 1);
    const passed =
      Math.abs(dx) > SWIPE_THRESHOLD_PX || velocity > SWIPE_VELOCITY_TRIGGER;

    if (passed) {
      if (dx < 0 && canSwipeLeft) {
        // swipe left → next tab
        setSnapping(true);
        // animate out fully, then navigate
        const w = swipeRef.current?.getBoundingClientRect().width ?? 0;
        setDragDx(-w);
        window.setTimeout(() => {
          setDragDx(0);
          setSnapping(false);
          goToIndex(activeIndex + 1, 1);
        }, 220);
        return;
      }
      if (dx > 0 && canSwipeRight) {
        setSnapping(true);
        const w = swipeRef.current?.getBoundingClientRect().width ?? 0;
        setDragDx(w);
        window.setTimeout(() => {
          setDragDx(0);
          setSnapping(false);
          goToIndex(activeIndex - 1, -1);
        }, 220);
        return;
      }
    }
    // Snap back
    setSnapping(true);
    setDragDx(0);
    window.setTimeout(() => setSnapping(false), 380);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const duration = performance.now() - s.startTime;
    const wasActive = s.active;
    dragState.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (wasActive) finishDrag(dx, duration);
  };

  const onPointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s) return;
    dragState.current = null;
    if (s.active) {
      setSnapping(true);
      setDragDx(0);
      window.setTimeout(() => setSnapping(false), 380);
    }
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const isDragging = dragDx !== 0;
  const peekRight = isDragging && dragDx < -10 && canSwipeLeft;   // next tab peeking from right
  const peekLeft = isDragging && dragDx > 10 && canSwipeRight;    // prev tab peeking from left
  const dragOpacity = 1 - Math.min(0.35, Math.abs(dragDx) / 500);

  // Re-arm enter animation class based on direction
  const enterClass =
    enterDir === 1
      ? "animate-page-in-right"
      : enterDir === -1
      ? "animate-page-in-left"
      : "animate-route-in";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        ref={swipeRef}
        className="relative"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {/* Side hint chevrons appear while dragging */}
        <div className={cn("swipe-peek pointer-events-none", peekLeft && "show")}
             style={{ justifyContent: "flex-start", paddingLeft: 16 }}
             aria-hidden>
          <div className="chev"><ChevronLeft className="h-6 w-6" /></div>
        </div>
        <div className={cn("swipe-peek pointer-events-none", peekRight && "show")}
             style={{ justifyContent: "flex-end", paddingRight: 16 }}
             aria-hidden>
          <div className="chev"><ChevronRight className="h-6 w-6" /></div>
        </div>

        <main
          key={animKey}
          className={cn("swipe-layer pb-28 safe-top", enterClass, snapping && "snap")}
          style={{
            transform: `translate3d(${dragDx}px, 0, 0)`,
            opacity: dragOpacity,
          }}
        >
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="mx-auto max-w-md px-3 pb-2">
          <div
            ref={navRef}
            className="glass-strong rounded-3xl shadow-ios-lg px-2 py-2 flex justify-between relative"
          >
            {pill && (
              <span
                ref={indicatorRef}
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
                  data-no-swipe
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  onClick={() => {
                    vibrate(8);
                    pulseIndicator();
                    setEnterDir(i > activeIndex ? 1 : i < activeIndex ? -1 : 0);
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

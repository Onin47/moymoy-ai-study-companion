import { useEffect, useRef, useState } from "react";

type Props = {
  /** Element whose `.scene-paused` class reflects pause state. */
  sceneRef: React.RefObject<HTMLElement | null>;
  /** Hide entirely when false. */
  enabled?: boolean;
};

/**
 * Lightweight FPS / dropped-frame / pause-state HUD.
 * Uses requestAnimationFrame (no profiler API needed) and assumes a 60Hz target.
 * Intentionally cheap: updates DOM at most 4×/second.
 */
export function PerfOverlay({ sceneRef, enabled = true }: Props) {
  const [fps, setFps] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let frames = 0;
    let last = performance.now();
    let totalDropped = 0;
    let prevFrameTs = last;
    const target = 1000 / 60;

    const tick = (now: number) => {
      frames += 1;
      const delta = now - prevFrameTs;
      // Anything over ~1.5 frames late counts as a dropped frame.
      if (delta > target * 1.5) {
        totalDropped += Math.floor(delta / target) - 1;
      }
      prevFrameTs = now;

      if (now - last >= 250) {
        const measured = Math.round((frames * 1000) / (now - last));
        setFps(measured);
        setDropped(totalDropped);
        // Read pause state from the observed scene element.
        const el = sceneRef.current;
        if (el) setPaused(el.classList.contains("scene-paused"));
        frames = 0;
        last = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, sceneRef]);

  if (!enabled) return null;

  const fpsColor = fps >= 55 ? "#86efac" : fps >= 40 ? "#fde68a" : "#fca5a5";

  return (
    <div
      role="status"
      aria-live="off"
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 9999,
        font: "600 11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace",
        color: "#fff",
        background: "rgba(10,6,16,0.78)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: "8px 10px",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        pointerEvents: "none",
        minWidth: 132,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span style={{ opacity: 0.6 }}>FPS</span>
        <span style={{ color: fpsColor }}>{fps}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span style={{ opacity: 0.6 }}>Dropped</span>
        <span>{dropped}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span style={{ opacity: 0.6 }}>Scene</span>
        <span style={{ color: paused ? "#fde68a" : "#86efac" }}>
          {paused ? "paused" : "running"}
        </span>
      </div>
    </div>
  );
}

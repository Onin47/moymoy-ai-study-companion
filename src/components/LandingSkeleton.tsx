import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reserves the same visual footprint as the floating icon scene so the page
 * doesn't jump while the lazy scene mounts.
 */
export function SceneSkeleton() {
  return (
    <div
      className="scene-skeleton"
      aria-hidden
      style={{
        width: "min(320px, 82vw)",
        height: "clamp(200px, 32vh, 260px)",
      }}
    >
      <div className="scene-skeleton-inner">
        <Skeleton className="h-16 w-16 rounded-2xl bg-white/10" />
        <Skeleton className="h-24 w-24 rounded-3xl bg-white/10" />
        <Skeleton className="h-16 w-16 rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

/**
 * Reserves the LandingPreview footprint — chip row, note, AI bar, flashcard,
 * and 3-day plan — so layout doesn't shift when the live preview mounts.
 */
export function LandingPreviewSkeleton() {
  return (
    <section className="w-full mt-2 mb-6" aria-hidden>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Skeleton className="h-3 w-3 rounded-full bg-white/10" />
        <Skeleton className="h-3 w-20 bg-white/10" />
      </div>
      <div className="flex gap-2 mb-3 px-1">
        <Skeleton className="h-7 w-20 rounded-full bg-white/10" />
        <Skeleton className="h-7 w-20 rounded-full bg-white/10" />
        <Skeleton className="h-7 w-24 rounded-full bg-white/10" />
      </div>
      <div className="preview-surface rounded-3xl p-3.5">
        <div className="preview-block rounded-2xl p-3.5 space-y-2">
          <Skeleton className="h-3 w-20 bg-white/10" />
          <Skeleton className="h-3 w-full bg-white/10" />
          <Skeleton className="h-3 w-4/5 bg-white/10" />
        </div>
        <div className="flex items-center gap-2 my-3 px-1">
          <Skeleton className="h-6 w-6 rounded-full bg-white/10" />
          <Skeleton className="h-3 w-48 bg-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Skeleton className="h-[140px] w-full rounded-2xl bg-white/8" />
          <div className="preview-block rounded-2xl p-3.5 space-y-2">
            <Skeleton className="h-3 w-28 bg-white/10" />
            <Skeleton className="h-8 w-full rounded-xl bg-white/8" />
            <Skeleton className="h-8 w-full rounded-xl bg-white/8" />
            <Skeleton className="h-8 w-full rounded-xl bg-white/8" />
          </div>
        </div>
      </div>
    </section>
  );
}

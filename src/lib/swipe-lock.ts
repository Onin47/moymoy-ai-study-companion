// Lightweight global "lock swipe navigation" flag.
// Components like the focus timer set this to true when they want to
// prevent the AppShell swipe-to-change-tab gesture (e.g. during a
// locked-in focus session).

const KEY = "__moymoy_swipe_locked";
const EVT = "moymoy:swipe-lock-change";

declare global {
  interface Window {
    [KEY]?: boolean;
  }
}

export function setSwipeLock(locked: boolean) {
  if (typeof window === "undefined") return;
  window[KEY] = locked;
  window.dispatchEvent(new CustomEvent(EVT, { detail: locked }));
}

export function isSwipeLocked(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window[KEY]);
}

export function onSwipeLockChange(cb: (locked: boolean) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => cb(Boolean((e as CustomEvent<boolean>).detail));
  window.addEventListener(EVT, handler);
  return () => window.removeEventListener(EVT, handler);
}

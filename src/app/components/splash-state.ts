// Shared splash-screen state so the Hero can sequence its entrance after the
// splash instead of animating unseen behind it.
//
// Decision/demo overrides via query param:
//   ?splash=on   force the splash (replay option B)
//   ?splash=off  skip the splash (preview option A)
// Default: shown once per browser session.

export const SPLASH_DONE_EVENT = "solafidei:splash-done";
const SEEN_KEY = "sf-splash-seen";

export function splashEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const param = new URLSearchParams(window.location.search).get("splash");
  if (param === "off") return false;
  if (param === "on") return true;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markSplashSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // private mode etc. — splash will just show again next load
  }
}

export function emitSplashDone() {
  window.dispatchEvent(new Event(SPLASH_DONE_EVENT));
}

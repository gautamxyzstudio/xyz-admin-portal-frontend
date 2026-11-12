import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { RefreshCw, X } from "lucide-react";

/**
 * Keeps users on the latest deploy without a manual hard refresh.
 *
 * - Polls /version.json (no-store) every 2 minutes, when the tab becomes
 *   visible again, and on page changes.
 * - When the build id differs from the running one:
 *     · the tab is in the background      -> reload right away
 *     · the user moves to another page     -> reload on that navigation
 *     · otherwise                          -> show a small "Update ready" bar
 *       that reloads on click, or on its own after 60s if the user is idle.
 * - If an old cached chunk can't be loaded after a deploy (vite:preloadError),
 *   reload once.
 *
 * Nothing runs in `npm run dev` (no version.json there).
 */

const CHECK_EVERY_MS = 2 * 60 * 1000;
const AUTO_RELOAD_MS = 60 * 1000;
const RELOAD_GUARD_KEY = "xyz:reloaded-for";

const running = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "";

const hardReload = (version: string) => {
  try {
    // avoid reload loops if the server keeps serving an old index.html
    if (sessionStorage.getItem(RELOAD_GUARD_KEY) === version) return false;
    sessionStorage.setItem(RELOAD_GUARD_KEY, version);
  } catch {
    /* storage unavailable: reload anyway */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("v", String(Date.now())); // bypass a cached index.html
  window.location.replace(url.toString());
  return true;
};

const fetchLatest = async (): Promise<string | null> => {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.version === "string" ? data.version : null;
  } catch {
    return null;
  }
};

const AppUpdater: React.FC = () => {
  const location = useLocation();
  const [latest, setLatest] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const lastActivity = useRef(0);
  const firstPath = useRef(true);

  const updateReady = !!latest && !!running && latest !== running;

  const check = useCallback(async () => {
    if (import.meta.env.DEV || !running) return;
    const v = await fetchLatest();
    if (!v || v === running) return;
    if (document.visibilityState === "hidden") {
      hardReload(v);
      return;
    }
    setLatest(v);
  }, []);

  // clean the ?v= cache-buster from the address bar after a reload
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("v")) {
      url.searchParams.delete("v");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }
  }, []);

  // periodic + on focus/visibility
  useEffect(() => {
    if (import.meta.env.DEV) return;
    lastActivity.current = Date.now();
    const first = window.setTimeout(check, 5000);
    const t = window.setInterval(check, CHECK_EVERY_MS);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [check]);

  // page change: safe moment to reload if an update is waiting, otherwise check
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    if (updateReady && latest) hardReload(latest);
    // async version check; state updates after the fetch resolves
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else check();
    // only on path changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // stale lazy chunk after a deploy -> reload once
  useEffect(() => {
    const onPreloadError = (e: Event) => {
      e.preventDefault();
      hardReload(`chunk-${running}`);
    };
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => window.removeEventListener("vite:preloadError", onPreloadError);
  }, []);

  // auto reload once the user has been idle for a minute
  useEffect(() => {
    if (!updateReady || !latest) return;
    const bump = () => {
      lastActivity.current = Date.now();
    };
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, bump, { passive: true }));
    const t = window.setInterval(() => {
      const typing =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (!typing && Date.now() - lastActivity.current > AUTO_RELOAD_MS) hardReload(latest);
    }, 5000);
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, bump));
      window.clearInterval(t);
    };
  }, [updateReady, latest]);

  if (!updateReady || dismissed) return null;

  return (
    <div className="app-update fixed bottom-5 left-1/2 -translate-x-1/2 z-[2100]" role="status">
      <div className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl bg-white border border-primary-20 shadow-xl">
        <span className="relative grid place-items-center w-8 h-8 rounded-xl bg-primary-20 text-primary">
          <RefreshCw size={15} className="app-update-spin" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-black-80">A new version is ready</p>
          <p className="text-[11px] text-black-50">Refresh to get the latest changes.</p>
        </div>
        <button
          onClick={() => latest && hardReload(latest)}
          className="ml-2 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:brightness-105 active:scale-95 transition cursor-pointer"
        >
          Refresh now
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Later"
          title="Later — it will update when you change page"
          className="grid place-items-center w-7 h-7 rounded-full text-gray-400 hover:text-primary hover:bg-primary-20 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default AppUpdater;

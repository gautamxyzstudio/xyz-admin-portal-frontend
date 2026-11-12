/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";

/**
 * Notification tune: plays /sounds/notification.mp3 when new unread
 * notifications arrive. Users can mute it (remembered per browser).
 */

const SOUND_URL = "/sounds/notification.mp3";
const MUTE_KEY = "xyz:notification-sound-muted";
const MUTE_EVENT = "xyz:notification-sound-muted";

let audio: HTMLAudioElement | null = null;
let lastPlayed = 0;

export const isSoundMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
};

export const setSoundMuted = (muted: boolean) => {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(MUTE_EVENT, { detail: muted }));
};

/** Play the tune (rate-limited, silently ignored if the browser blocks it). */
export const playNotificationSound = () => {
  if (isSoundMuted()) return;
  const now = Date.now();
  if (now - lastPlayed < 3000) return; // several at once -> one chime
  lastPlayed = now;
  try {
    if (!audio) {
      audio = new Audio(SOUND_URL);
      audio.preload = "auto";
      audio.volume = 0.6;
    }
    audio.currentTime = 0;
    void audio.play().catch(() => {
      /* autoplay blocked until the user has interacted with the page */
    });
  } catch {
    /* ignore */
  }
};

/** React state for the mute switch, synced across components. */
export const useSoundMuted = () => {
  const [muted, setMuted] = useState(isSoundMuted);
  useEffect(() => {
    const on = (e: Event) => setMuted(!!(e as CustomEvent).detail);
    window.addEventListener(MUTE_EVENT, on);
    return () => window.removeEventListener(MUTE_EVENT, on);
  }, []);
  return [muted, (m: boolean) => setSoundMuted(m)] as const;
};

/**
 * Watches the notification list and plays the tune when an unread
 * notification shows up that wasn't there before. The first load never
 * plays (so opening the portal doesn't chime for old items).
 * Returns a counter that increases on each new arrival (for animations).
 */
export const useNotificationChime = (notifications: any[] | undefined) => {
  const seen = useRef<Set<string> | null>(null);
  const [arrivals, setArrivals] = useState(0);

  useEffect(() => {
    if (!Array.isArray(notifications)) return;
    const ids = notifications.map((n) => String(n.id));
    if (seen.current === null) {
      seen.current = new Set(ids);
      return;
    }
    const fresh = notifications.filter((n) => !n.isRead && !seen.current!.has(String(n.id)));
    ids.forEach((id) => seen.current!.add(id));
    if (fresh.length) {
      playNotificationSound();
      setArrivals((a) => a + 1);
    }
  }, [notifications]);

  return arrivals;
};

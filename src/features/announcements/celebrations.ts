/* Shared helpers for celebration announcements (birthday / joining / anniversary). */

export type CelebrationKind = "birthday" | "joining" | "anniversary";

export interface CelebrationEvent {
  /** unique per event + day, used to show it only once */
  key: string;
  kind: CelebrationKind;
  /** names to celebrate (empty = generic) */
  names: string[];
  /** the event is about the logged-in user */
  isSelf: boolean;
  /** plain-text message (no HTML) */
  message: string;
}

export const CELEBRATE_EVENT = "xyz:celebrate";

/** Map an announcement title to a celebration kind. */
export const celebrationKind = (title?: string | null): CelebrationKind | null => {
  const t = (title || "").toLowerCase();
  if (t.includes("birthday")) return "birthday";
  if (t.includes("anniversary")) return "anniversary";
  if (t.includes("joined") || t.includes("welcome") || t.includes("new employee")) return "joining";
  return null;
};

/** Names wrapped in <b>…</b> by the backend cron, e.g. "<b>Rakhi, Sumit</b>". */
export const extractNames = (html?: string | null): string[] => {
  const out: string[] = [];
  const re = /<b>(.*?)<\/b>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html || ""))) {
    m[1]
      .split(",")
      .map((s) => s.replace(/\(.*?\)/g, "").trim())
      .filter(Boolean)
      .forEach((n) => out.push(n));
  }
  return out;
};

export const stripHtml = (html?: string | null) =>
  (html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

/** today in IST as YYYY-MM-DD */
export const istToday = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

/** "YYYY-MM-DD…" -> "MM-DD" */
export const monthDay = (d?: string | null) => (d && d.length >= 10 ? d.slice(5, 10) : "");

/** ask the overlay to play a celebration now (e.g. when a card is clicked) */
export const playCelebration = (event: CelebrationEvent) =>
  window.dispatchEvent(new CustomEvent<CelebrationEvent>(CELEBRATE_EVENT, { detail: event }));

/* "shown once per day" memory; storage can be unavailable, so never throw */
const SEEN_KEY = "xyz:celebrations-seen";
export const wasShown = (key: string) => {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
    return !!seen[key];
  } catch {
    return false;
  }
};
export const markShown = (key: string) => {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
    const today = istToday();
    // keep only today's entries so the store never grows
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(seen)) if (v === today) next[k] = v as string;
    next[key] = today;
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
};

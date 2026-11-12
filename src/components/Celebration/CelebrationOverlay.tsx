import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { userDetailsInState, userInState } from "../../features/auth/authSlice";
import { useGetAnnouncementsQuery } from "../../features/announcements/announcementsApi";
import {
  CELEBRATE_EVENT,
  type CelebrationEvent,
  type CelebrationKind,
  celebrationKind,
  extractNames,
  istToday,
  markShown,
  monthDay,
  stripHtml,
  wasShown,
} from "../../features/announcements/celebrations";

/* ---------------- look per kind ---------------- */

const THEME: Record<
  CelebrationKind,
  { emoji: string; colors: string[]; title: (e: CelebrationEvent) => string; cta: string; accent: string }
> = {
  birthday: {
    emoji: "🎂",
    colors: ["#F17C04", "#F8BD81", "#EC4899", "#8B5CF6", "#0EA5E9", "#FACC15"],
    title: (e) =>
      e.isSelf
        ? "Happy Birthday to you!"
        : e.names.length
          ? `Happy Birthday, ${joinNames(e.names)}!`
          : "Happy Birthday!",
    cta: "Send wishes 🎉",
    accent: "from-pink-500 to-primary",
  },
  joining: {
    emoji: "👋",
    colors: ["#F17C04", "#F8BD81", "#10B981", "#0EA5E9", "#FACC15"],
    title: (e) =>
      e.isSelf
        ? "Welcome to the team!"
        : e.names.length
          ? `Say hello to ${joinNames(e.names)}!`
          : "New team member!",
    cta: "Welcome aboard 🙌",
    accent: "from-sky-500 to-primary",
  },
  anniversary: {
    emoji: "🏆",
    colors: ["#F17C04", "#FACC15", "#F8BD81", "#FDE68A", "#FB923C"],
    title: (e) =>
      e.isSelf
        ? "Happy Work Anniversary!"
        : e.names.length
          ? `Cheers to ${joinNames(e.names)}!`
          : "Work Anniversary!",
    cta: "Congratulate 🥂",
    accent: "from-amber-400 to-primary",
  },
};

const joinNames = (names: string[]) =>
  names.length <= 2 ? names.join(" & ") : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;

/* ---------------- confetti (canvas, no dependencies) ---------------- */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "star" | "balloon";
  life: number;
};

const prefersReducedMotion = () => {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

/** Runs one confetti show on the canvas; returns a stop function. */
function runConfetti(canvas: HTMLCanvasElement, kind: CelebrationKind): () => void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const colors = THEME[kind].colors;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const parts: Particle[] = [];

    const burst = (x: number, y: number, n: number, spread: number, angle: number, speed: number) => {
      for (let i = 0; i < n; i++) {
        const a = angle + rand(-spread, spread);
        const s = rand(speed * 0.5, speed);
        parts.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.2, 0.2),
          size: rand(6, 11),
          color: pick(colors),
          shape: kind === "anniversary" && Math.random() < 0.45 ? "star" : Math.random() < 0.3 ? "circle" : "rect",
          life: 0,
        });
      }
    };

    // opening: side cannons for joining, top shower for birthday, centre fountain for anniversary
    if (kind === "joining") {
      burst(0, H() * 0.75, 90, 0.5, -Math.PI / 3, 18);
      burst(W(), H() * 0.75, 90, 0.5, (-2 * Math.PI) / 3, 18);
    } else if (kind === "anniversary") {
      burst(W() / 2, H() * 0.55, 160, 0.9, -Math.PI / 2, 20);
    } else {
      for (let i = 0; i < 140; i++) burst(rand(0, W()), rand(-H() * 0.6, -10), 1, Math.PI, Math.PI / 2, 3);
      // balloons drifting up
      for (let i = 0; i < 14; i++)
        parts.push({
          x: rand(W() * 0.05, W() * 0.95),
          y: H() + rand(20, 400),
          vx: rand(-0.4, 0.4),
          vy: rand(-2.6, -1.6),
          rot: rand(-0.2, 0.2),
          vr: 0,
          size: rand(26, 40),
          color: pick(colors),
          shape: "balloon",
          life: 0,
        });
    }

    let raf = 0;
    let frame = 0;
    const drawStar = (r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.45 : r;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    };

    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, W(), H());
      // a second wave shortly after
      if (frame === 45 && kind !== "birthday") {
        if (kind === "joining") {
          burst(0, H() * 0.6, 50, 0.5, -Math.PI / 4, 16);
          burst(W(), H() * 0.6, 50, 0.5, (-3 * Math.PI) / 4, 16);
        } else burst(W() / 2, H() * 0.55, 80, 0.9, -Math.PI / 2, 17);
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        if (p.shape === "balloon") {
          p.x += p.vx + Math.sin((p.life + i * 20) / 30) * 0.6;
          p.y += p.vy;
        } else {
          p.vx *= 0.985;
          p.vy = p.vy * 0.985 + 0.32;
          p.x += p.vx + Math.sin(p.life / 12 + i) * 0.4;
          p.y += p.vy;
          p.rot += p.vr;
        }
        if (p.y > H() + 60 || p.y < -500 || p.life > 600) {
          parts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "star") drawStar(p.size / 1.6);
        else {
          // balloon + string
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.42, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.ellipse(-p.size * 0.14, -p.size * 0.18, p.size * 0.08, p.size * 0.13, -0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = "#9ca3af";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, p.size / 2);
          ctx.quadraticCurveTo(6, p.size, 0, p.size * 1.5);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (parts.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, W(), H());
    };
}

function useConfetti(canvas: HTMLCanvasElement | null, kind: CelebrationKind | null, runId: number) {
  useEffect(() => {
    if (!canvas || !kind || prefersReducedMotion()) return;
    return runConfetti(canvas, kind);
    // runId restarts the show when the same kind plays again
  }, [canvas, kind, runId]);
}

/* ---------------- overlay ---------------- */

const AUTO_CLOSE_MS = 9000;

const CelebrationOverlay: React.FC = () => {
  const user = useSelector(userInState) as { username?: string } | null;
  const details = useSelector(userDetailsInState) as
    | { name?: string; date_of_birth?: string; joinig_date?: string }
    | null;
  const { data: announcements = [] } = useGetAnnouncementsQuery(undefined, {
    skip: !user,
    pollingInterval: 5 * 60_000,
  });

  const [queue, setQueue] = useState<CelebrationEvent[]>([]);
  const [current, setCurrent] = useState<CelebrationEvent | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [runId, setRunId] = useState(0);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const timer = useRef<number | undefined>(undefined);

  /* today's events: the user's own first, then announcements */
  const todaysEvents = useMemo(() => {
    if (!user) return [];
    const today = istToday();
    const md = today.slice(5);
    const me = [user.username, details?.name].filter(Boolean).map((s) => String(s).toLowerCase());
    const isMe = (n: string) => me.includes(n.toLowerCase());
    const out: CelebrationEvent[] = [];

    if (monthDay(details?.date_of_birth) === md)
      out.push({ key: `self:birthday:${today}`, kind: "birthday", names: [], isSelf: true, message: "Wishing you a wonderful year ahead from everyone at XYZ Studio! 🎉" });
    if (details?.joinig_date?.slice(0, 10) === today)
      out.push({ key: `self:joining:${today}`, kind: "joining", names: [], isSelf: true, message: "We're so happy to have you here. Here's to a great journey together!" });
    else if (monthDay(details?.joinig_date) === md && details?.joinig_date && details.joinig_date.slice(0, 4) < today.slice(0, 4)) {
      const years = Number(today.slice(0, 4)) - Number(details.joinig_date.slice(0, 4));
      out.push({ key: `self:anniversary:${today}`, kind: "anniversary", names: [], isSelf: true, message: `${years} ${years === 1 ? "year" : "years"} with us — thank you for everything you do!` });
    }

    for (const a of announcements) {
      const kind = celebrationKind(a.title);
      if (!kind || String(a.date || "").slice(0, 10) !== today) continue;
      const names = extractNames(a.description);
      const others = names.filter((n) => !isMe(n));
      // the user's own one is already covered above
      if (names.length && !others.length && out.some((e) => e.kind === kind && e.isSelf)) continue;
      out.push({
        key: `ann:${a.id}:${today}`,
        kind,
        names: others.length ? others : names,
        isSelf: false,
        message: stripHtml(a.description),
      });
    }
    return out;
  }, [announcements, user, details]);

  // queue anything not shown yet today
  useEffect(() => {
    const fresh = todaysEvents.filter((e) => !wasShown(e.key));
    if (!fresh.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueue((q) => [...q, ...fresh.filter((e) => !q.some((x) => x.key === e.key))]);
  }, [todaysEvents]);

  // replay on demand (announcement card click)
  useEffect(() => {
    const onPlay = (e: Event) => {
      const ev = (e as CustomEvent<CelebrationEvent>).detail;
      if (ev) setQueue((q) => [ev, ...q.filter((x) => x.key !== ev.key)]);
    };
    window.addEventListener(CELEBRATE_EVENT, onPlay);
    return () => window.removeEventListener(CELEBRATE_EVENT, onPlay);
  }, []);

  // take the next one
  useEffect(() => {
    if (current || !queue.length) return;
    const [next, ...rest] = queue;
    markShown(next.key);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueue(rest);
    setCurrent(next);
    setLeaving(false);
    setRunId((r) => r + 1);
  }, [queue, current]);

  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    setLeaving(true);
    timer.current = window.setTimeout(() => {
      setCurrent(null);
      setLeaving(false);
    }, 260);
  }, []);

  useEffect(() => {
    if (!current) return;
    timer.current = window.setTimeout(close, AUTO_CLOSE_MS);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener("keydown", onKey);
    };
  }, [current, close]);

  useConfetti(canvas, current?.kind ?? null, runId);

  if (!current) return null;
  const t = THEME[current.kind];

  return createPortal(
    <div
      className={`celebrate-root fixed inset-0 z-[2000] flex items-center justify-center p-4 ${
        leaving ? "celebrate-out" : "celebrate-in"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t.title(current)}
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <canvas ref={setCanvas} className="pointer-events-none fixed inset-0 w-full h-full" />

      <div
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => window.clearTimeout(timer.current)}
        className="celebrate-card relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden text-center"
      >
        <div className={`h-24 bg-linear-to-r ${t.accent} relative overflow-hidden`}>
          <span className="celebrate-shine absolute inset-0" />
        </div>
        <span className={`celebrate-emoji celebrate-emoji-${current.kind} absolute left-1/2 top-24 -translate-x-1/2 -translate-y-1/2 grid place-items-center w-20 h-20 rounded-full bg-white shadow-lg text-4xl`}>
          {t.emoji}
        </span>
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full bg-white/25 text-white hover:bg-white/40 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="px-6 pt-14 pb-6">
          <h3 className="celebrate-text text-xl font-bold text-black-80" style={{ animationDelay: "120ms" }}>
            {t.title(current)}
          </h3>
          {current.message && (
            <p className="celebrate-text text-sm text-black-50 mt-2 leading-relaxed" style={{ animationDelay: "200ms" }}>
              {current.message}
            </p>
          )}
          <button
            onClick={close}
            className="celebrate-text mt-5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
            style={{ animationDelay: "280ms" }}
          >
            {current.isSelf ? "Thank you! 🧡" : t.cta}
          </button>
          {queue.length > 0 && (
            <p className="text-[11px] text-black-50 mt-3">+{queue.length} more celebration{queue.length > 1 ? "s" : ""} today</p>
          )}
        </div>
        <span className="celebrate-timer absolute bottom-0 left-0 h-1 bg-primary" style={{ animationDuration: `${AUTO_CLOSE_MS}ms` }} />
      </div>
    </div>,
    document.body,
  );
};

export default CelebrationOverlay;

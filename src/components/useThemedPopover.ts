import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";

/**
 * Open/close + positioning for the themed dropdown / date pickers.
 * The popup is rendered in a portal with `position: fixed`, so it is never
 * clipped by a scrolling or overflow-hidden parent, and it flips above the
 * trigger when there is no room below.
 */

const CLOSE_MS = 140;
const GAP = 6;

export interface PopoverPos {
  style: React.CSSProperties;
  placement: "bottom" | "top";
}

export function useThemedPopover(opts: {
  align?: "left" | "right";
  matchWidth?: boolean;
  /** roughly how tall the popup can get, used to decide flipping */
  estHeight?: number;
}) {
  const { align = "left", matchWidth = false, estHeight = 280 } = opts;
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [pos, setPos] = useState<PopoverPos>({ style: {}, placement: "bottom" });
  const triggerRef = useRef<HTMLElement | null>(null);
  const popRef = useRef<HTMLElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const below = vh - r.bottom;
    const up = below < estHeight + GAP && r.top > below;
    const style: React.CSSProperties = { position: "fixed" };
    if (up) style.bottom = vh - r.top + GAP;
    else style.top = r.bottom + GAP;
    if (align === "right") style.right = Math.max(8, vw - r.right);
    else style.left = Math.max(8, Math.min(r.left, vw - 8 - (matchWidth ? r.width : 180)));
    if (matchWidth) style.width = r.width;
    else style.minWidth = r.width;
    style.maxHeight = Math.max(160, (up ? r.top : below) - GAP - 12);
    setPos({ style, placement: up ? "top" : "bottom" });
  }, [align, matchWidth, estHeight]);

  const show = useCallback(() => {
    window.clearTimeout(timer.current);
    // portal inside an open MUI dialog (so its focus trap does not steal
    // focus from a search box), otherwise into document.body
    setPortalEl(
      (triggerRef.current?.closest(".MuiDialog-container, .MuiModal-root") as HTMLElement | null) ??
        document.body,
    );
    place();
    setClosing(false);
    setOpen(true);
  }, [place]);

  const hide = useCallback(() => {
    setClosing(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, CLOSE_MS);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const onMove = () => place();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || popRef.current?.contains(t)) return;
      hide();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        hide();
      }
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, hide]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const bindTrigger = useCallback((el: HTMLElement | null) => {
    triggerRef.current = el;
  }, []);
  const bindPop = useCallback((el: HTMLElement | null) => {
    popRef.current = el;
  }, []);
  const focusTrigger = useCallback(() => triggerRef.current?.focus({ preventScroll: true }), []);

  return {
    open,
    closing,
    isOpen: open && !closing,
    show,
    hide,
    toggle: () => (open && !closing ? hide() : show()),
    bindTrigger,
    bindPop,
    focusTrigger,
    pos,
    /** element to portal the popup into (set when opened) */
    portalEl: portalEl ?? document.body,
  };
}

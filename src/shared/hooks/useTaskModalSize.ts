import { useCallback, useState } from "react";

/**
 * Size of the add / edit / view task modals: "wide" (default) or "full" screen.
 * The choice is remembered per browser.
 */
type Size = "wide" | "full";
const KEY = "xyz:task-modal-size";

const read = (): Size => {
  try {
    return localStorage.getItem(KEY) === "full" ? "full" : "wide";
  } catch {
    return "wide";
  }
};

export const useTaskModalSize = () => {
  const [size, setSize] = useState<Size>(read);
  const toggle = useCallback(() => {
    setSize((s) => {
      const next: Size = s === "full" ? "wide" : "full";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const panelClass =
    size === "full"
      ? "task-modal w-[calc(100vw-2rem)] max-w-none h-[calc(100vh-2rem)] max-h-none rounded-2xl"
      : "task-modal w-full max-w-4xl max-h-[92vh] rounded-3xl";

  return { size, isFull: size === "full", toggle, panelClass };
};


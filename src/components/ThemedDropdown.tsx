import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { useThemedPopover } from "./useThemedPopover";

export interface DropdownOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  /** text used by the search box when `label` is not a plain string */
  searchText?: string;
  disabled?: boolean;
}

interface Props<T extends string | number> {
  value: T | null | undefined;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  /**
   * boxed = small bordered pill (toolbars), plain = text only,
   * field = full-size form field (forms / dialogs)
   */
  variant?: "boxed" | "plain" | "field";
  /** which edge the menu lines up with */
  align?: "left" | "right";
  /** stretch the trigger (and menu) to the parent's width */
  fullWidth?: boolean;
  placeholder?: React.ReactNode;
  disabled?: boolean;
  /** show a search box; defaults to on when there are more than 8 options */
  searchable?: boolean;
  searchPlaceholder?: string;
  error?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  ariaLabel?: string;
}

const textOf = (o: DropdownOption<string | number>) =>
  (o.searchText ?? (typeof o.label === "string" || typeof o.label === "number" ? String(o.label) : ""))
    .toLowerCase();

/**
 * Animated dropdown in the theme colour. Use it instead of a native <select>
 * everywhere so every dropdown in the portal looks and moves the same.
 * Styles: "Themed dropdown" in index.css.
 */
function ThemedDropdown<T extends string | number>({
  value,
  options,
  onChange,
  variant = "boxed",
  align = "left",
  fullWidth = variant === "field",
  placeholder = "Select…",
  disabled = false,
  searchable,
  searchPlaceholder = "Search…",
  error = false,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  ariaLabel,
}: Props<T>) {
  const {
    open: popOpen,
    closing,
    isOpen,
    show,
    hide,
    bindTrigger,
    bindPop,
    focusTrigger,
    pos,
    portalEl,
  } = useThemedPopover({ align, matchWidth: fullWidth });
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const withSearch = searchable ?? options.length > 8;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => textOf(o).includes(q)) : options;
  }, [options, query]);

  const selected = options.find((o) => o.value === value);

  const openMenu = () => {
    if (disabled) return;
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    show();
  };

  useEffect(() => {
    if (isOpen && withSearch) searchRef.current?.focus({ preventScroll: true });
  }, [isOpen, withSearch]);

  const pick = (o: DropdownOption<T>) => {
    if (o.disabled) return;
    if (o.value !== value) onChange(o.value);
    hide();
    focusTrigger();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Tab") hide();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(shown.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || (e.key === " " && !withSearch)) {
      e.preventDefault();
      if (shown[active]) pick(shown[active]);
    }
  };

  const menu = popOpen
    ? createPortal(
        <div
          ref={bindPop}
          style={pos.style}
          onKeyDown={onKeyDown}
          className={`tdd-menu ${pos.placement === "top" ? "tdd-up" : ""} ${
            closing ? "tdd-menu-out" : "tdd-menu-in"
          } ${menuClassName}`}
        >
          {withSearch && (
            <div className="tdd-search">
              <Search size={13} className="shrink-0" />
              <input
                ref={searchRef}
                value={query}
                placeholder={searchPlaceholder}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
              />
            </div>
          )}
          <ul id={listId} role="listbox" className="tdd-list">
            {shown.length === 0 ? (
              <li className="tdd-empty">No matches</li>
            ) : (
              shown.map((o, i) => {
                const isSel = o.value === value;
                return (
                  <li
                    key={String(o.value)}
                    role="option"
                    aria-selected={isSel}
                    aria-disabled={o.disabled}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(o)}
                    style={{ animationDelay: `${Math.min(i, 8) * 22}ms` }}
                    className={`tdd-option ${isSel ? "tdd-selected" : ""} ${
                      i === active ? "tdd-active" : ""
                    } ${o.disabled ? "tdd-disabled" : ""}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {isSel && <Check size={13} className="tdd-check shrink-0" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>,
        portalEl,
      )
    : null;

  return (
    <div className={`relative ${fullWidth ? "block w-full" : "inline-block"} ${className}`}>
      <button
        type="button"
        ref={bindTrigger}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (isOpen ? hide() : openMenu())}
        onKeyDown={onKeyDown}
        className={`tdd-trigger tdd-${variant} ${fullWidth ? "tdd-full" : ""} ${
          isOpen ? "tdd-open" : ""
        } ${error ? "tdd-error" : ""} ${triggerClassName}`}
      >
        <span className={`min-w-0 flex-1 truncate text-left ${selected ? "" : "tdd-placeholder"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={variant === "field" ? 16 : 14} className="tdd-chevron shrink-0" />
      </button>
      {menu}
    </div>
  );
}

export default ThemedDropdown;

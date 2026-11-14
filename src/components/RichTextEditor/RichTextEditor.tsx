import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Eraser,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import { sanitizeHtml } from "../../utils/richText";

/**
 * Small WYSIWYG editor for task descriptions (no external dependency).
 * - Bold / Italic / Underline / Strikethrough, heading, lists, quote, link, clear
 * - Ctrl/Cmd + B / I / U shortcuts
 * - Pasted text/HTML is cleaned; pasted images are left to the page's
 *   screenshot handler (they become attachments).
 * Value is HTML (a safe subset, see utils/richText.ts).
 */

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  autoFocus?: boolean;
}

type Cmd = "bold" | "italic" | "underline" | "strikeThrough" | "insertUnorderedList" | "insertOrderedList";

const TOOLS: { cmd: Cmd | "h2" | "quote" | "link" | "clear"; icon: React.ElementType; label: string; key?: string }[] = [
  { cmd: "bold", icon: Bold, label: "Bold", key: "Ctrl+B" },
  { cmd: "italic", icon: Italic, label: "Italic", key: "Ctrl+I" },
  { cmd: "underline", icon: Underline, label: "Underline", key: "Ctrl+U" },
  { cmd: "strikeThrough", icon: Strikethrough, label: "Strikethrough" },
  { cmd: "h2", icon: Heading2, label: "Heading" },
  { cmd: "insertUnorderedList", icon: List, label: "Bulleted list" },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
  { cmd: "quote", icon: Quote, label: "Quote" },
  { cmd: "link", icon: Link2, label: "Link" },
  { cmd: "clear", icon: Eraser, label: "Clear formatting" },
];

const RichTextEditor: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "Write a description…",
  minHeight = 140,
  disabled = false,
  invalid = false,
  className = "",
  autoFocus = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtml = useRef<string>("");
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [focused, setFocused] = useState(false);
  const [empty, setEmpty] = useState(true);

  // load external value (initial / reset / switching task) without fighting the cursor
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const incoming = sanitizeHtml(value || "");
    if (incoming !== lastHtml.current) {
      el.innerHTML = incoming;
      lastHtml.current = incoming;
      setEmpty(!el.textContent?.trim());
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const text = el.textContent?.trim() || "";
    const html = text || el.querySelector("li") ? el.innerHTML : "";
    setEmpty(!text);
    const clean = sanitizeHtml(html);
    lastHtml.current = clean;
    onChange(clean);
  }, [onChange]);

  // toolbar active state follows the cursor
  useEffect(() => {
    const update = () => {
      if (!ref.current || !ref.current.contains(document.getSelection()?.anchorNode || null)) return;
      const next: Record<string, boolean> = {};
      for (const c of ["bold", "italic", "underline", "strikeThrough", "insertUnorderedList", "insertOrderedList"])
        try {
          next[c] = document.queryCommandState(c);
        } catch {
          next[c] = false;
        }
      try {
        const block = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
        next.h2 = block === "h2" || block === "heading 2";
        next.quote = block === "blockquote";
      } catch {
        /* ignore */
      }
      setActive(next);
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  const run = (cmd: (typeof TOOLS)[number]["cmd"]) => {
    if (disabled) return;
    ref.current?.focus();
    document.execCommand("styleWithCSS", false, "false");
    if (cmd === "h2") document.execCommand("formatBlock", false, active.h2 ? "p" : "h2");
    else if (cmd === "quote") document.execCommand("formatBlock", false, active.quote ? "p" : "blockquote");
    else if (cmd === "clear") {
      document.execCommand("removeFormat");
      document.execCommand("formatBlock", false, "p");
    } else if (cmd === "link") {
      const sel = document.getSelection();
      const current = sel?.anchorNode?.parentElement?.closest("a")?.getAttribute("href") || "https://";
      const url = window.prompt("Link address", current);
      if (url === null) return;
      if (!url.trim() || url.trim() === "https://") document.execCommand("unlink");
      else if (/^(https?:|mailto:|tel:)/i.test(url.trim())) {
        if (sel && sel.isCollapsed) document.execCommand("insertHTML", false, `<a href="${url.trim()}">${url.trim()}</a>`);
        else document.execCommand("createLink", false, url.trim());
      }
    } else document.execCommand(cmd);
    emit();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === "b" || k === "i" || k === "u") {
      e.preventDefault();
      run(k === "b" ? "bold" : k === "i" ? "italic" : "underline");
    } else if (k === "k") {
      e.preventDefault();
      run("link");
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    const cd = e.clipboardData;
    // images: let the page-level screenshot handler turn them into attachments
    if (Array.from(cd.items || []).some((it) => it.type.startsWith("image/"))) return;
    const html = cd.getData("text/html");
    const text = cd.getData("text/plain");
    if (!html && !text) return;
    e.preventDefault();
    const safe = html ? sanitizeHtml(html) : sanitizeHtml(text);
    document.execCommand("insertHTML", false, safe);
    emit();
  };

  return (
    <div
      className={`rte rounded-2xl border bg-[#fafafa] transition-all ${
        invalid ? "border-rose-400" : focused ? "rte-focused" : "border-slate-200/90"
      } ${disabled ? "opacity-60 pointer-events-none" : ""} ${className}`}
    >
      <div className="rte-toolbar flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200/80">
        {TOOLS.map(({ cmd, icon: Icon, label, key }, i) => (
          <React.Fragment key={cmd}>
            {(i === 4 || i === 5 || i === 8) && <span className="w-px h-5 bg-slate-200 mx-1" />}
            <button
              type="button"
              tabIndex={-1}
              title={key ? `${label} (${key})` : label}
              aria-label={label}
              aria-pressed={!!active[cmd]}
              onMouseDown={(e) => e.preventDefault()} // keep the selection
              onClick={() => run(cmd)}
              className={`rte-btn grid place-items-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                active[cmd] ? "bg-primary-20 text-primary" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <Icon size={15} />
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className="relative">
        {empty && (
          <span className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400">{placeholder}</span>
        )}
        <div
          ref={ref}
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emit}
          onBlur={() => {
            setFocused(false);
            emit();
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          style={{ minHeight }}
          className="rich-text px-4 py-3 text-sm text-slate-800 outline-none max-h-[50vh] overflow-y-auto"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;

/** Read-only display of a (sanitized) description; plain-text descriptions still look right. */
export const RichTextView: React.FC<{ value?: string | null; className?: string; empty?: React.ReactNode }> = ({
  value,
  className = "",
  empty = null,
}) => {
  const html = sanitizeHtml(value || "");
  if (!html) return <>{empty}</>;
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
};

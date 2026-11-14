/**
 * Helpers for rich-text task descriptions.
 *
 * Descriptions are stored as a small, safe subset of HTML. Older descriptions
 * are plain text; everything here accepts both.
 */

const ALLOWED_TAGS = new Set([
  "P", "BR", "DIV", "SPAN",
  "B", "STRONG", "I", "EM", "U", "S", "STRIKE", "DEL",
  "UL", "OL", "LI",
  "H2", "H3", "H4",
  "BLOCKQUOTE", "CODE", "PRE",
  "A",
]);

// tags whose content is dropped entirely
const DROP_WITH_CONTENT = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "TEMPLATE", "NOSCRIPT", "SVG", "MATH", "HEAD", "TITLE", "META", "LINK"]);

const SAFE_URL = /^(https?:|mailto:|tel:)/i;

export const looksLikeHtml = (s?: string | null) => !!s && /<\/?[a-z][\s\S]*?>/i.test(s);

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text (old descriptions) -> paragraphs/line breaks, with links made clickable. */
export const textToHtml = (text: string) =>
  escapeHtml(text)
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("")
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

/**
 * Keep only formatting tags; strip every attribute except a safe href on links.
 * Uses the browser's parser, so it never executes anything.
 */
export const sanitizeHtml = (input?: string | null): string => {
  if (!input) return "";
  const html = looksLikeHtml(input) ? input : textToHtml(input);
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild as HTMLElement | null;
  if (!root) return "";

  const clean = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child as HTMLElement;
      const tag = el.tagName.toUpperCase();

      if (DROP_WITH_CONTENT.has(tag)) {
        el.remove();
        continue;
      }
      if (!ALLOWED_TAGS.has(tag)) {
        // unwrap unknown tags but keep their text
        clean(el);
        el.replaceWith(...Array.from(el.childNodes));
        continue;
      }

      // map presentational styles from pasted content (e.g. Google Docs) to tags
      let wrapped: HTMLElement = el;
      if (tag === "SPAN") {
        const st = (el.getAttribute("style") || "").toLowerCase();
        const bold = /font-weight:\s*(bold|[6-9]00)/.test(st);
        const italic = /font-style:\s*italic/.test(st);
        const underline = /text-decoration[^;]*underline/.test(st);
        for (const [on, t] of [[bold, "strong"], [italic, "em"], [underline, "u"]] as const) {
          if (!on) continue;
          const w = doc.createElement(t);
          while (wrapped.firstChild) w.appendChild(wrapped.firstChild);
          wrapped.appendChild(w);
          wrapped = w;
        }
      }

      const href = tag === "A" ? (el.getAttribute("href") || "").trim() : "";
      for (const attr of Array.from(el.attributes)) el.removeAttribute(attr.name);
      if (tag === "A") {
        if (SAFE_URL.test(href)) {
          el.setAttribute("href", href);
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
      }
      clean(el);
    }
  };
  clean(root);

  // spans without attributes are noise
  root.querySelectorAll("span").forEach((s) => s.replaceWith(...Array.from(s.childNodes)));
  return root.innerHTML.trim();
};

/** Readable plain text from a description (for previews, search, notifications). */
export const htmlToText = (input?: string | null): string => {
  if (!input) return "";
  if (!looksLikeHtml(input)) return input;
  const doc = new DOMParser().parseFromString(
    input.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[2-4]|blockquote|pre)>/gi, "\n"),
    "text/html",
  );
  return (doc.body.textContent || "").replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
};

/** True when a description has no visible text. */
export const isRichTextEmpty = (input?: string | null) => !htmlToText(input).trim();

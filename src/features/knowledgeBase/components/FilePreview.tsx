/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AlertTriangle, Download, ExternalLink, Loader2, Minimize2, RotateCw } from "lucide-react";
import { endpoints } from "../../../api/endpoints";
import { tokenInState } from "../../auth/authSlice";
import type { KbFile } from "../knowledgeBase.types";
import { fileKind, formatBytes, sanitizeHtml } from "../kbUtils";
import FileBadge from "./FileBadge";

type Loaded =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; url: string; html?: string; text?: string; blob: Blob; diagrams?: string[] };

const PDF_MIME = "application/pdf";

/* ---------- Markdown extras: ```mermaid diagrams and GitHub-style > [!NOTE] callouts ---------- */

const MERMAID_FENCE = /^```mermaid[^\n]*\n([\s\S]*?)^```[ \t]*\r?$/gm;
const mermaidToken = (i: number) => `KBMERMAIDBLOCK${i}KB`;

/** Pulls mermaid blocks out before markdown parsing (they're rendered separately as SVG). */
const extractMermaid = (md: string) => {
  const blocks: string[] = [];
  const text = md.replace(MERMAID_FENCE, (_m, code: string) => {
    blocks.push(code);
    return `\n\n${mermaidToken(blocks.length - 1)}\n\n`;
  });
  return { text, blocks };
};

const ALERTS: Record<string, string> = {
  NOTE: "Note",
  TIP: "Tip",
  IMPORTANT: "Important",
  WARNING: "Warning",
  CAUTION: "Caution",
};

/** Runs on already-sanitised HTML: adds diagram placeholders and callout styling. */
const enhanceMarkdownHtml = (html: string, mermaidCount: number) => {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  for (let i = 0; i < mermaidCount; i++) {
    const token = mermaidToken(i);
    const p = [...doc.body.querySelectorAll("p")].find((el) => el.textContent?.trim() === token);
    if (!p) continue;
    const div = doc.createElement("div");
    div.className = "kb-mermaid";
    div.setAttribute("data-mermaid", String(i));
    div.textContent = "Rendering diagram…";
    p.replaceWith(div);
  }
  doc.body.querySelectorAll("blockquote").forEach((bq) => {
    const first = bq.querySelector("p");
    const m = first?.innerHTML.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(<br\s*\/?>)?\s*/i);
    if (!first || !m) return;
    const type = m[1].toUpperCase();
    first.innerHTML = first.innerHTML.slice(m[0].length);
    if (!first.textContent?.trim() && !first.querySelector("img")) first.remove();
    const title = doc.createElement("p");
    title.className = "kb-alert-title";
    title.textContent = ALERTS[type];
    bq.prepend(title);
    bq.className = `kb-alert kb-alert-${type.toLowerCase()}`;
  });
  return doc.body.innerHTML;
};

/**
 * In state & sequence diagrams a ";" ends the statement, so labels like
 * "Client visits gym; owner scans QR" break the diagram. Escape it as #59; (mermaid's entity code).
 */
const fixMermaidSource = (src: string) => {
  const type = src.match(/^\s*([\w-]+)/)?.[1] || "";
  if (!/^(stateDiagram|sequenceDiagram)/.test(type)) return src;
  return src
    .split("\n")
    .map((line) => {
      if (/^\s*(classDef|style|class |%%)/.test(line)) return line;
      const i = line.indexOf(":");
      return i < 0 ? line : line.slice(0, i + 1) + line.slice(i + 1).replace(/;/g, "#59;");
    })
    .join("\n");
};

let mermaidSeq = 0;

let mermaidPromise: Promise<any> | null = null;
const loadMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "neutral",
        fontFamily: "inherit",
        suppressErrorRendering: true, // never inject the "Syntax error" bomb into the page
      });
      return mermaid;
    });
  }
  return mermaidPromise;
};

/** Removes anything dangerous docx-preview may have produced from the document's own links. */
const scrubDocxDom = (root: HTMLElement) => {
  root.querySelectorAll("script, iframe, object, embed").forEach((el) => el.remove());
  root.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (!/^(https?:|mailto:|tel:|#)/i.test(href.trim())) a.removeAttribute("href");
    else if (!href.startsWith("#")) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });
};

interface Props {
  articleId: number;
  file: KbFile;
  /** Taller preview when the knowledge base is in full-screen mode. */
  tall?: boolean;
  /** Document-only full screen (covers the whole window). */
  expanded?: boolean;
  onCloseExpanded?: () => void;
}

/**
 * In-app preview of an uploaded document.
 *  - PDF       → browser's built-in PDF viewer
 *  - DOCX      → rendered as pages with docx-preview
 *  - Markdown  → rendered with marked (then sanitised)
 *  - TXT       → plain text
 *  - DOC (old) → no preview, download only
 * The file is fetched through the API (auth + project access checked there).
 */
const FilePreview: React.FC<Props> = ({ articleId, file, tall, expanded, onCloseExpanded }) => {
  const token = useSelector(tokenInState);
  const kind = fileKind(file.ext || file.name);
  const [state, setState] = useState<Loaded>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const docxRef = useRef<HTMLDivElement>(null);
  const mdRef = useRef<HTMLDivElement>(null);

  /* full screen: Esc closes, page behind doesn't scroll */
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation(); // don't also close the knowledge-base full screen
        onCloseExpanded?.();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [expanded, onCloseExpanded]);

  /* draw ```mermaid diagrams inside markdown files */
  useEffect(() => {
    if (kind !== "markdown" || state.status !== "ready" || !state.diagrams?.length || !mdRef.current) return;
    const root = mdRef.current;
    const diagrams = state.diagrams;
    let cancelled = false;
    (async () => {
      let mermaid: any;
      try {
        mermaid = await loadMermaid();
      } catch (err) {
        console.error("Mermaid failed to load", err);
        return;
      }
      const slots = [...root.querySelectorAll<HTMLElement>(".kb-mermaid[data-mermaid]")];
      for (const slot of slots) {
        if (cancelled) return;
        const src = diagrams[Number(slot.dataset.mermaid)] || "";
        const id = `kbm-${articleId}-${++mermaidSeq}`;
        try {
          const { svg } = await mermaid.render(id, fixMermaidSource(src));
          if (!cancelled) slot.innerHTML = svg; // strict mode: mermaid sanitises labels
        } catch (err: any) {
          // mermaid renders in temporary nodes on <body>; on errors they can be left behind
          // (the successful SVG carries the same id, so only clean up here)
          document.getElementById(id)?.remove();
          document.getElementById(`d${id}`)?.remove();
          document.getElementById(`i${id}`)?.remove();
          // show the diagram source with the reason instead of a broken diagram
          const note = document.createElement("p");
          note.className = "kb-mermaid-error-note";
          note.textContent = `Diagram couldn't be drawn: ${String(err?.message || err).split("\n")[0]}`;
          const pre = document.createElement("pre");
          pre.textContent = src;
          slot.replaceChildren(note, pre);
          slot.classList.add("kb-mermaid-error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, state, articleId]);

  useEffect(() => {
    const ctrl = new AbortController();
    let objectUrl = "";
    setState({ status: "loading" });

    (async () => {
      try {
        const res = await fetch(endpoints.kbArticleFile(articleId), {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        });
        if (!res.ok) {
          let msg = `Couldn't load the file (${res.status})`;
          try {
            const j = await res.json();
            msg = j?.error?.message || msg;
          } catch {
            /* not json */
          }
          throw new Error(msg);
        }
        const raw = await res.blob();
        const blob = kind === "pdf" ? new Blob([raw], { type: PDF_MIME }) : raw;
        objectUrl = URL.createObjectURL(blob);

        if (kind === "markdown") {
          const { marked } = await import("marked");
          const { text, blocks } = extractMermaid(await blob.text());
          const html = enhanceMarkdownHtml(
            sanitizeHtml(await marked.parse(text, { gfm: true, breaks: false })),
            blocks.length,
          );
          setState({ status: "ready", url: objectUrl, html, blob, diagrams: blocks });
        } else if (kind === "text") {
          setState({ status: "ready", url: objectUrl, text: await blob.text(), blob });
        } else {
          setState({ status: "ready", url: objectUrl, blob });
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setState({ status: "error", message: err?.message || "Couldn't load the file" });
      }
    })();

    return () => {
      ctrl.abort();
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    };
  }, [articleId, file.id, kind, token, reloadKey]);

  /* render .docx once the blob is ready */
  useEffect(() => {
    if (kind !== "docx" || state.status !== "ready" || !docxRef.current) return;
    const container = docxRef.current;
    let cancelled = false;
    container.innerHTML = "";
    import("docx-preview")
      .then(({ renderAsync }) =>
        renderAsync(state.blob, container, undefined, {
          className: "kb-docx",
          inWrapper: true,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          useBase64URL: true,
          experimental: true,
        }),
      )
      .then(() => {
        if (!cancelled) scrubDocxDom(container);
      })
      .catch((err) => {
        console.error("DOCX preview failed", err);
        if (!cancelled) setState({ status: "error", message: "This Word file couldn't be previewed. Download it instead." });
      });
    return () => {
      cancelled = true;
    };
  }, [kind, state]);

  const download = () => {
    if (state.status !== "ready") return;
    const a = document.createElement("a");
    a.href = state.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const viewerHeight = expanded ? "calc(100vh - 63px)" : tall ? "calc(100vh - 260px)" : "75vh";

  return (
    <div
      className={
        expanded ? "fixed inset-0 z-[1100] bg-white flex flex-col" : "rounded-2xl border border-gray-100 overflow-hidden"
      }
    >
      {/* file bar */}
      <div className="flex flex-wrap items-center gap-3 justify-between px-4 py-3 bg-[#fafafa] border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <FileBadge ext={file.ext || file.name} size={36} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-black-80 truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-[11px] text-black-50">{formatBytes(file.size)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {kind === "pdf" && state.status === "ready" && (
            <a
              href={state.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-black-80 hover:border-primary hover:text-primary"
            >
              <ExternalLink size={14} /> Open
            </a>
          )}
          <button
            onClick={download}
            disabled={state.status !== "ready"}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-105 disabled:opacity-60 cursor-pointer"
          >
            <Download size={14} /> Download
          </button>
          {expanded && (
            <button
              onClick={onCloseExpanded}
              title="Exit full screen (Esc)"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-black-80 hover:border-primary hover:text-primary cursor-pointer"
            >
              <Minimize2 size={14} /> Exit
            </button>
          )}
        </div>
      </div>

      {/* body */}
      {state.status === "loading" ? (
        <div className="grid place-items-center py-24">
          <Loader2 size={22} className="animate-spin text-primary" />
          <p className="text-xs text-black-50 mt-2">Loading preview…</p>
        </div>
      ) : state.status === "error" ? (
        <div className="flex flex-col items-center text-center py-16 px-6">
          <AlertTriangle size={22} className="text-amber-500 mb-2" />
          <p className="text-sm text-black-80">{state.message}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-black-80 hover:border-primary hover:text-primary cursor-pointer"
          >
            <RotateCw size={13} /> Try again
          </button>
        </div>
      ) : kind === "pdf" ? (
        <iframe title={file.name} src={state.url} className="w-full block bg-[#525659]" style={{ height: viewerHeight }} />
      ) : kind === "docx" ? (
        <div ref={docxRef} className="kb-docx-host overflow-auto" style={{ maxHeight: viewerHeight }} />
      ) : kind === "markdown" ? (
        <div
          ref={mdRef}
          className="kb-prose kb-markdown px-6 py-5 overflow-auto"
          style={{ maxHeight: viewerHeight }}
          dangerouslySetInnerHTML={{ __html: state.html || "" }}
        />
      ) : kind === "text" ? (
        <pre className="kb-text-preview overflow-auto px-6 py-5" style={{ maxHeight: viewerHeight }}>
          {state.text}
        </pre>
      ) : (
        <div className="flex flex-col items-center text-center py-16 px-6">
          <FileBadge ext={file.ext || file.name} size={48} />
          <p className="text-sm font-semibold text-black-80 mt-3">Preview isn't available for this file type</p>
          <p className="text-xs text-black-50 mt-1 max-w-sm">
            Old Word (.doc) files can't be shown in the browser. Download it, or re-save it as .docx and upload again for a
            preview.
          </p>
        </div>
      )}
    </div>
  );
};

export default FilePreview;

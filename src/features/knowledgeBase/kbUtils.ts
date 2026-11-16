/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import type { KbArticle } from "./knowledgeBase.types";

/* ------------------------------------------------------------------ */
/* HTML sanitiser — allow-list based, runs in the browser via DOMParser */
/* ------------------------------------------------------------------ */

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "div", "span",
  "h1", "h2", "h3", "h4",
  "b", "strong", "i", "em", "u", "s", "strike", "sub", "sup", "mark",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
]);
const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "form", "input", "button",
  "textarea", "select", "meta", "link", "base", "svg", "math", "noscript", "template",
]);
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title"],
  img: ["src", "alt", "title", "width"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

const safeUrl = (url: string, forImg = false) => {
  const v = url.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(v)) return v;
  if (forImg && /^data:image\/(png|jpe?g|gif|webp);/i.test(v)) return v;
  return "";
};

const cleanNode = (node: Node, doc: Document) => {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as Element;
    const tag = el.tagName.toLowerCase();

    if (DROP_WITH_CONTENT.has(tag)) {
      el.remove();
      return;
    }
    if (!ALLOWED_TAGS.has(tag)) {
      // unwrap: keep the text/children, drop the tag itself
      cleanNode(el, doc);
      const frag = doc.createDocumentFragment();
      while (el.firstChild) frag.appendChild(el.firstChild);
      el.replaceWith(frag);
      return;
    }

    const allowed = ALLOWED_ATTRS[tag] || [];
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (!allowed.includes(name)) {
        el.removeAttribute(attr.name);
        return;
      }
      if (name === "href" || name === "src") {
        const v = safeUrl(attr.value, name === "src");
        if (v) el.setAttribute(name, v);
        else el.removeAttribute(attr.name);
      }
    });
    if (tag === "a") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
    cleanNode(el, doc);
  });
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  cleanNode(doc.body, doc);
  return doc.body.innerHTML;
};

export const isHtmlEmpty = (html: string) =>
  !html ||
  (!/<img\b/i.test(html) &&
    new DOMParser().parseFromString(html, "text/html").body.textContent?.trim() === "");

export const plainTextExcerpt = (html: string, max = 120) => {
  const text =
    new DOMParser().parseFromString(html || "", "text/html").body.textContent?.replace(/\s+/g, " ").trim() || "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

export const formatDate = (d?: string | null) => (d ? dayjs(d).format("DD MMM YYYY, hh:mm A") : "");

/* ------------------------------------------------------------------ */
/* Downloads                                                           */
/* ------------------------------------------------------------------ */

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const safeFileName = (s: string) =>
  (s || "knowledge-base").replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "-").slice(0, 80) || "knowledge-base";

const DOC_STYLES = `
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #222; line-height: 1.5; }
  h1.kb-doc-title { font-size: 22pt; color: #F17C04; margin: 0 0 4pt; }
  .kb-doc-meta { color: #777; font-size: 9pt; margin-bottom: 18pt; }
  h2.kb-article-title { font-size: 16pt; color: #111; border-bottom: 1px solid #eee; padding-bottom: 4pt; margin-top: 24pt; }
  .kb-article-meta { color: #888; font-size: 9pt; margin-bottom: 8pt; }
  h1 { font-size: 18pt; } h2 { font-size: 15pt; } h3 { font-size: 13pt; }
  blockquote { border-left: 3px solid #F17C04; margin: 8pt 0; padding: 4pt 10pt; color: #555; }
  pre, code { font-family: Consolas, "Courier New", monospace; background: #f5f5f5; }
  pre { padding: 8pt; white-space: pre-wrap; }
  table { border-collapse: collapse; } td, th { border: 1px solid #ccc; padding: 4pt 6pt; }
  img { max-width: 100%; }
  .kb-toc li { margin: 2pt 0; }
  .page-break { page-break-before: always; }
`;

const articleBlock = (a: KbArticle, i: number) => `
  <div class="${i > 0 ? "page-break" : ""}">
    <h2 class="kb-article-title">${escapeHtml(a.title)}</h2>
    <div class="kb-article-meta">
      ${a.author ? `By ${escapeHtml(a.author.username)} · ` : ""}Last updated ${escapeHtml(formatDate(a.updatedAt))}
      ${a.lastEditedBy && a.lastEditedBy.id !== a.author?.id ? ` by ${escapeHtml(a.lastEditedBy.username)}` : ""}
    </div>
    ${sanitizeHtml(a.content)}
  </div>`;

const buildDocument = (projectTitle: string, articles: KbArticle[], withToc: boolean) => {
  const toc =
    withToc && articles.length > 1
      ? `<h3>Contents</h3><ol class="kb-toc">${articles.map((a) => `<li>${escapeHtml(a.title)}</li>`).join("")}</ol>`
      : "";
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(projectTitle)} — Knowledge Base</title><style>${DOC_STYLES}</style></head>
<body>
  <h1 class="kb-doc-title">${escapeHtml(projectTitle)}</h1>
  <div class="kb-doc-meta">Knowledge base · ${articles.length} ${articles.length === 1 ? "article" : "articles"} · Exported ${escapeHtml(dayjs().format("DD MMM YYYY, hh:mm A"))}</div>
  ${toc}
  ${articles.map(articleBlock).join("\n")}
</body></html>`;
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

/** Word-compatible .doc (HTML flavour) — opens in Word, Google Docs, LibreOffice. */
export const downloadAsWord = (projectTitle: string, articles: KbArticle[], fileTitle?: string) => {
  const html = buildDocument(projectTitle, articles, true);
  triggerDownload(
    new Blob(["﻿", html], { type: "application/msword" }),
    `${safeFileName(fileTitle || `${projectTitle}-knowledge-base`)}.doc`,
  );
};

/* ---------- real PDF download (pdfmake: real text, proper line wrapping & page breaks) ---------- */

const ORANGE = "#F17C04";
const CONTENT_WIDTH = 515; // A4 width (595pt) minus 40pt margins each side

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

/** pdfmake needs images as data URLs (png/jpeg). WebP/GIF are converted via a canvas. */
const imageToDataUrl = async (src: string): Promise<string | null> => {
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (/image\/(png|jpe?g)/i.test(blob.type)) return await blobToDataUrl(blob);
    // convert other formats to PNG
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((ok, fail) => {
        const i = new Image();
        i.onload = () => ok(i);
        i.onerror = fail;
        i.src = url;
      });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")?.drawImage(img, 0, 0);
      return c.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null; // usually a CORS block on the storage bucket
  }
};

/** Inline images as data URLs; any that can't be loaded become a link instead. */
const prepareHtmlForPdf = async (html: string) => {
  const doc = new DOMParser().parseFromString(`<body>${sanitizeHtml(html)}</body>`, "text/html");
  await Promise.all(
    [...doc.body.querySelectorAll("img")].map(async (img) => {
      const src = img.getAttribute("src") || "";
      const data = src.startsWith("data:image/png") || src.startsWith("data:image/jp") ? src : await imageToDataUrl(src);
      if (data) {
        img.setAttribute("src", data);
        img.removeAttribute("width");
      } else {
        const a = doc.createElement("a");
        a.setAttribute("href", src);
        a.textContent = `[Image: ${img.getAttribute("alt") || "open link"}]`;
        img.replaceWith(a);
      }
    }),
  );
  // links: show the URL after the text so it's useful on paper too
  doc.body.querySelectorAll("a").forEach((a) => a.removeAttribute("target"));
  return doc.body.innerHTML;
};

/** Make every image fit the page width and keep code blocks / quotes readable. */
const fixNodes = (node: any): any => {
  if (Array.isArray(node)) return node.map(fixNodes);
  if (!node || typeof node !== "object") return node;
  if (node.image) {
    delete node.width;
    delete node.height;
    node.fit = [CONTENT_WIDTH, 640];
    node.margin = [0, 4, 0, 8];
  }
  if (node.stack) node.stack = fixNodes(node.stack);
  if (node.text && Array.isArray(node.text)) node.text = fixNodes(node.text);
  if (node.ul) node.ul = fixNodes(node.ul);
  if (node.ol) node.ol = fixNodes(node.ol);
  if (node.columns) node.columns = fixNodes(node.columns);
  if (node.table?.body) node.table.body = node.table.body.map((row: any[]) => row.map(fixNodes));
  return node;
};

let pdfMakePromise: Promise<any> | null = null;
const loadPdfMake = () => {
  if (!pdfMakePromise) {
    pdfMakePromise = Promise.all([
      import("pdfmake/build/pdfmake"),
      import("pdfmake/build/vfs_fonts"),
    ]).then(([pm, fonts]: any[]) => {
      const pdfMake = pm.default || pm;
      const vfs = fonts.default?.pdfMake?.vfs || fonts.pdfMake?.vfs || fonts.default || fonts;
      if (typeof pdfMake.addVirtualFileSystem === "function") pdfMake.addVirtualFileSystem(vfs);
      else pdfMake.vfs = vfs;
      return pdfMake;
    });
  }
  return pdfMakePromise;
};

/** Generates and downloads a real .pdf (A4, selectable text, page numbers, one article per page). */
/** Builds the pdfmake document (shared by download and share). */
const createKbPdf = async (projectTitle: string, articles: KbArticle[], fileTitle?: string) => {
  const [pdfMake, { default: htmlToPdfmake }] = await Promise.all([
    loadPdfMake(),
    import("html-to-pdfmake") as Promise<any>,
  ]);

  const htmlOptions = {
    window,
    removeExtraBlanks: true,
    defaultStyles: {
      p: { margin: [0, 0, 0, 6] },
      div: { margin: [0, 0, 0, 4] },
      h1: { fontSize: 18, bold: true, margin: [0, 10, 0, 6] },
      h2: { fontSize: 15, bold: true, margin: [0, 10, 0, 5] },
      h3: { fontSize: 13, bold: true, margin: [0, 8, 0, 4] },
      h4: { fontSize: 11.5, bold: true, margin: [0, 6, 0, 3] },
      a: { color: ORANGE, decoration: "underline" },
      ul: { margin: [0, 0, 0, 6] },
      ol: { margin: [0, 0, 0, 6] },
      li: { margin: [0, 1, 0, 1] },
      blockquote: { italics: false, color: "#444444", background: "#FFF7EF", margin: [8, 4, 0, 8] },
      pre: { fontSize: 9, background: "#F4F4F4", margin: [0, 4, 0, 8], preserveLeadingSpaces: true },
      code: { fontSize: 9, background: "#F4F4F4" },
      th: { bold: true, fillColor: "#F7F7F7" },
      hr: { margin: [0, 8, 0, 8] },
    },
  };

  const single = articles.length === 1;
  const content: any[] = [
    { text: projectTitle, fontSize: 22, bold: true, color: ORANGE, margin: [0, 0, 0, 2] },
    {
      text: `Knowledge base${single ? "" : ` · ${articles.length} articles`} · Exported ${dayjs().format("DD MMM YYYY, hh:mm A")}`,
      fontSize: 9,
      color: "#888888",
      margin: [0, 0, 0, 6],
    },
    { canvas: [{ type: "line", x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 1.5, lineColor: ORANGE }], margin: [0, 0, 0, 14] },
  ];

  if (!single) {
    content.push({
      toc: { title: { text: "Contents", fontSize: 14, bold: true, margin: [0, 0, 0, 8] } },
      margin: [0, 0, 0, 10],
    });
  }

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const meta = `${a.author ? `By ${a.author.username} · ` : ""}Last updated ${formatDate(a.updatedAt)}${
      a.lastEditedBy && a.lastEditedBy.id !== a.author?.id ? ` by ${a.lastEditedBy.username}` : ""
    }`;
    const body = isHtmlEmpty(a.content)
      ? [{ text: "No content.", italics: true, color: "#999999" }]
      : fixNodes(htmlToPdfmake(await prepareHtmlForPdf(a.content), htmlOptions));

    content.push({
      stack: [
        {
          text: a.title,
          fontSize: 17,
          bold: true,
          color: "#111111",
          tocItem: !single,
          tocMargin: [0, 2, 0, 2],
          margin: [0, 0, 0, 3],
        },
        { text: meta, fontSize: 8.5, color: "#888888", margin: [0, 0, 0, 4] },
        { canvas: [{ type: "line", x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 0.5, lineColor: "#E5E5E5" }], margin: [0, 0, 0, 10] },
        ...(Array.isArray(body) ? body : [body]),
      ],
      // multi-article export: each article starts on a fresh page (after the contents page)
      pageBreak: single ? undefined : "before",
    });
  }

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 50],
    info: { title: `${projectTitle} — Knowledge base`, author: "XYZ Studio" },
    defaultStyle: { font: "Roboto", fontSize: 10.5, lineHeight: 1.3, color: "#222222" },
    content,
    footer: (currentPage: number, pageCount: number) => ({
      margin: [40, 16, 40, 0],
      columns: [
        { text: `${projectTitle} — Knowledge base`, fontSize: 8, color: "#999999" },
        { text: `Page ${currentPage} of ${pageCount}`, fontSize: 8, color: "#999999", alignment: "right" },
      ],
    }),
  };

  const filename = `${safeFileName(fileTitle || `${projectTitle}-knowledge-base`)}.pdf`;
  return { pdf: pdfMake.createPdf(docDefinition), filename };
};

/** Generates and downloads a real .pdf (A4, selectable text, page numbers, one article per page). */
export const downloadAsPdf = async (projectTitle: string, articles: KbArticle[], fileTitle?: string) => {
  const { pdf, filename } = await createKbPdf(projectTitle, articles, fileTitle);
  await new Promise<void>((resolve) => {
    pdf.download(filename, () => resolve());
    // older builds don't call back reliably — don't leave the button spinning
    setTimeout(resolve, 4000);
  });
};

/** Same PDF as a File object — used by the share menu. */
export const buildPdfFile = async (projectTitle: string, articles: KbArticle[], fileTitle?: string) => {
  const { pdf, filename } = await createKbPdf(projectTitle, articles, fileTitle);
  const blob: Blob = await new Promise((resolve) => pdf.getBlob((b: Blob) => resolve(b)));
  return new File([blob], filename, { type: "application/pdf" });
};

/** Portal deep link to a project's knowledge base or one article (recipient must log in & have access). */
export const kbShareUrl = (projectId: number, articleId?: number) => {
  const url = new URL("/knowledge-base", window.location.origin);
  url.searchParams.set("project", String(projectId));
  if (articleId) url.searchParams.set("article", String(articleId));
  return url.toString();
};

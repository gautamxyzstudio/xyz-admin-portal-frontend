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

/* ---------- real PDF download (html2pdf.js, loaded on demand) ---------- */

const PDF_STYLES = `
  .kb-pdf { width: 718px; padding: 0; background: #fff; color: #222; font-family: Arial, Helvetica, sans-serif; font-size: 12.5px; line-height: 1.6; }
  .kb-pdf .kb-doc-title { font-size: 26px; font-weight: 700; color: #F17C04; margin: 0 0 4px; }
  .kb-pdf .kb-doc-meta { color: #777; font-size: 11px; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 2px solid #F17C04; }
  .kb-pdf .kb-toc-title { font-size: 15px; font-weight: 700; margin: 0 0 6px; }
  .kb-pdf .kb-toc { margin: 0 0 8px; padding-left: 22px; list-style: decimal; }
  .kb-pdf .kb-toc li { margin: 2px 0; }
  .kb-pdf .kb-article-title { font-size: 20px; font-weight: 700; color: #111; margin: 0 0 4px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
  .kb-pdf .kb-article-meta { color: #888; font-size: 10.5px; margin: 0 0 12px; }
  .kb-pdf p, .kb-pdf div { margin: 0 0 8px; }
  .kb-pdf h1 { font-size: 20px; font-weight: 700; margin: 16px 0 6px; }
  .kb-pdf h2 { font-size: 17px; font-weight: 700; margin: 14px 0 6px; }
  .kb-pdf h3 { font-size: 14.5px; font-weight: 700; margin: 12px 0 5px; }
  .kb-pdf ul { list-style: disc; padding-left: 22px; margin: 0 0 8px; }
  .kb-pdf ol { list-style: decimal; padding-left: 22px; margin: 0 0 8px; }
  .kb-pdf a { color: #F17C04; text-decoration: underline; }
  .kb-pdf blockquote { border-left: 3px solid #F17C04; background: #fff7ef; margin: 8px 0; padding: 6px 12px; color: #444; }
  .kb-pdf pre { background: #f4f4f4; border: 1px solid #e5e5e5; padding: 8px 10px; border-radius: 6px; white-space: pre-wrap; font-family: Consolas, "Courier New", monospace; font-size: 11px; }
  .kb-pdf code { font-family: Consolas, "Courier New", monospace; }
  .kb-pdf img { max-width: 100%; height: auto; margin: 6px 0; border-radius: 6px; }
  .kb-pdf hr { border: 0; border-top: 1px solid #ddd; margin: 14px 0; }
  .kb-pdf table { border-collapse: collapse; } .kb-pdf td, .kb-pdf th { border: 1px solid #ccc; padding: 4px 6px; }
  .kb-pdf .kb-page-break { page-break-before: always; break-before: page; }
`;

const buildPdfBody = (projectTitle: string, articles: KbArticle[]) => {
  const single = articles.length === 1;
  const toc =
    articles.length > 1
      ? `<div class="kb-toc-title">Contents</div><ol class="kb-toc">${articles.map((a) => `<li>${escapeHtml(a.title)}</li>`).join("")}</ol>`
      : "";
  const body = articles
    .map(
      (a) => `
      <section class="${single ? "" : "kb-page-break"}">
        <div class="kb-article-title">${escapeHtml(a.title)}</div>
        <div class="kb-article-meta">
          ${a.author ? `By ${escapeHtml(a.author.username)} · ` : ""}Last updated ${escapeHtml(formatDate(a.updatedAt))}${
            a.lastEditedBy && a.lastEditedBy.id !== a.author?.id ? ` by ${escapeHtml(a.lastEditedBy.username)}` : ""
          }
        </div>
        ${sanitizeHtml(a.content) || '<p style="color:#999"><i>No content.</i></p>'}
      </section>`,
    )
    .join("");
  return `
    <div class="kb-doc-title">${escapeHtml(projectTitle)}</div>
    <div class="kb-doc-meta">Knowledge base${single ? "" : ` · ${articles.length} articles`} · Exported ${escapeHtml(
      dayjs().format("DD MMM YYYY, hh:mm A"),
    )}</div>
    ${toc}
    ${body}`;
};

/** Generates and downloads a real .pdf file (A4, page numbers, page break per article). */
export const downloadAsPdf = async (projectTitle: string, articles: KbArticle[], fileTitle?: string) => {
  const { default: html2pdf } = await import("html2pdf.js");

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;background:#fff;";
  host.innerHTML = `<style>${PDF_STYLES}</style><div class="kb-pdf">${buildPdfBody(projectTitle, articles)}</div>`;
  document.body.appendChild(host);

  try {
    const target = host.querySelector(".kb-pdf") as HTMLElement;
    // wait for images so they appear in the PDF
    await Promise.all(
      [...target.querySelectorAll("img")].map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((res) => {
                img.onload = () => res();
                img.onerror = () => res();
              }),
      ),
    );

    const filename = `${safeFileName(fileTitle || `${projectTitle}-knowledge-base`)}.pdf`;
    const worker: any = (html2pdf() as any)
      .set({
        margin: [14, 12, 16, 12],
        filename,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: ["img", "pre", "blockquote", "tr", "li", ".kb-article-title"] },
      })
      .from(target)
      .toPdf();

    // footer: project name + page numbers
    const pdf = await worker.get("pdf");
    const total = pdf.internal.getNumberOfPages();
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    for (let i = 1; i <= total; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`${projectTitle} — Knowledge base`, 12, h - 7);
      pdf.text(`Page ${i} of ${total}`, w - 12, h - 7, { align: "right" });
    }
    await worker.save();
  } finally {
    host.remove();
  }
};

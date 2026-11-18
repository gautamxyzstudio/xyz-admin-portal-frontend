/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  Download,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useCreateKbArticleMutation,
  useDeleteKbArticleMutation,
  useGetKbArticlesQuery,
  useGetKbProjectsQuery,
  useUpdateKbArticleMutation,
  useUploadKbDocumentMutation,
} from "../knowledgeBaseApi";
import type { KbArticle, KbProject } from "../knowledgeBase.types";
import RichEditor from "../components/RichEditor";
import ShareMenu from "../components/ShareMenu";
import FilePreview from "../components/FilePreview";
import FileBadge from "../components/FileBadge";
import {
  ACCEPTED_DOC_INPUT,
  MAX_DOC_BYTES,
  isAcceptedDoc,
  buildPdfFile,
  downloadAsPdf,
  downloadAsWord,
  kbShareUrl,
  formatDate,
  isHtmlEmpty,
  plainTextExcerpt,
  sanitizeHtml,
} from "../kbUtils";
import { confirmDelete } from "../../../utils/confirmDelete";
import { getImageUrl } from "../../../utils/utils";
import "../kb.css";

/* ---------- small pieces ---------- */

const LOGO_BG = ["#F17C04", "#0EA5E9", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B", "#14B8A6", "#EC4899"];
const colorFor = (s: string) => LOGO_BG[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % LOGO_BG.length];
const initials = (s: string) =>
  s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const ProjectLogo: React.FC<{ title: string; url?: string | null; size?: number }> = ({ title, url, size = 36 }) => {
  const [failed, setFailed] = useState(false);
  const src = url ? getImageUrl(url) : "";
  return src && !failed ? (
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className="rounded-xl object-contain bg-white border border-gray-100 shrink-0 p-0.5"
    />
  ) : (
    <span
      style={{ width: size, height: size, background: `${colorFor(title)}1a`, color: colorFor(title), fontSize: size * 0.36 }}
      className="rounded-xl grid place-items-center font-bold shrink-0"
    >
      {initials(title)}
    </span>
  );
};

const errMsg = (err: any, fallback: string) =>
  err?.data?.error?.message || err?.data?.message || fallback;

type Mode = "view" | "edit" | "new";

/* ---------- screen ---------- */

const KnowledgeBase: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const projectId = Number(params.get("project")) || null;
  const articleId = Number(params.get("article")) || null;

  const [projectSearch, setProjectSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [mode, setMode] = useState<Mode>("view");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftHtml, setDraftHtml] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const dirtyRef = useRef(false);
  const [pdfBusy, setPdfBusy] = useState<"all" | number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showList, setShowList] = useState(true);
  const [uploadingNames, setUploadingNames] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [docFull, setDocFull] = useState(false);
  const closeDocFull = useCallback(() => setDocFull(false), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* full-screen: Esc closes it, page behind doesn't scroll */
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      // let Esc close open menus/dialogs first; only exit when nothing else is focused-open
      if (e.key === "Escape" && !document.querySelector(".swal2-container")) setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const { data: projData, isLoading: projLoading } = useGetKbProjectsQuery();
  const projects = useMemo(() => projData?.projects ?? [], [projData]);

  const { data: artData, isFetching: artFetching, isLoading: artLoading } = useGetKbArticlesQuery(projectId!, {
    skip: !projectId,
  });
  const articles = useMemo(() => artData?.articles ?? [], [artData]);

  const [createArticle, { isLoading: creating }] = useCreateKbArticleMutation();
  const [updateArticle, { isLoading: updating }] = useUpdateKbArticleMutation();
  const [deleteArticle] = useDeleteKbArticleMutation();
  const [uploadDocument] = useUploadKbDocumentMutation();
  const saving = creating || updating;

  const project: KbProject | undefined = projects.find((p) => p.id === projectId);
  const article: KbArticle | undefined = articles.find((a) => a.id === articleId);

  /* pick a sensible default project / article */
  useEffect(() => {
    if (!projectId && projects.length) {
      setParams({ project: String(projects[0].id) }, { replace: true });
    }
  }, [projectId, projects, setParams]);

  useEffect(() => {
    if (projectId && artData && mode === "view" && articles.length && !article) {
      setParams({ project: String(projectId), article: String(articles[0].id) }, { replace: true });
    }
  }, [projectId, artData, articles, article, mode, setParams]);

  /* warn before leaving the tab with unsaved edits */
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (mode !== "view" && dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [mode]);

  const okToLeaveEditor = () =>
    mode === "view" || !dirtyRef.current || window.confirm("You have unsaved changes. Discard them?");

  const resetEditor = () => {
    dirtyRef.current = false;
    setMode("view");
  };

  const selectProject = (id: number) => {
    if (id === projectId || !okToLeaveEditor()) return;
    resetEditor();
    setArticleSearch("");
    setParams({ project: String(id) });
  };

  const selectArticle = (id: number) => {
    if ((id === articleId && mode === "view") || !okToLeaveEditor()) return;
    resetEditor();
    setParams({ project: String(projectId), article: String(id) });
  };

  const startNew = () => {
    if (!okToLeaveEditor()) return;
    dirtyRef.current = false;
    setDraftTitle("");
    setDraftHtml("");
    setEditorKey((k) => k + 1);
    setMode("new");
  };

  const startEdit = () => {
    if (!article) return;
    dirtyRef.current = false;
    setDraftTitle(article.title);
    setDraftHtml(article.content);
    setEditorKey((k) => k + 1);
    setMode("edit");
  };

  const cancelEdit = () => {
    if (!okToLeaveEditor()) return;
    resetEditor();
  };

  const save = useCallback(async () => {
    if (!projectId || saving) return;
    const title = draftTitle.trim();
    if (!title) {
      toast.error("Give the article a title");
      return;
    }
    const content = isHtmlEmpty(draftHtml) ? "" : sanitizeHtml(draftHtml);
    try {
      if (mode === "new") {
        const res = await createArticle({ projectId, data: { title, content } }).unwrap();
        toast.success("Article added");
        resetEditor();
        setParams({ project: String(projectId), article: String(res.data.id) });
      } else if (mode === "edit" && article) {
        await updateArticle({ id: article.id, projectId, data: { title, content } }).unwrap();
        toast.success("Article saved");
        resetEditor();
      }
    } catch (err) {
      toast.error(errMsg(err, "Couldn't save the article"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, saving, draftTitle, draftHtml, mode, article]);

  /* Ctrl/Cmd + S to save while editing */
  useEffect(() => {
    if (mode === "view") return;
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mode, save]);

  /* ---------- upload PDF / Word / Markdown documents ---------- */
  const uploadDocs = async (list: File[]) => {
    if (!projectId || !list.length || uploadingNames.length) return;
    if (!okToLeaveEditor()) return;
    const valid: File[] = [];
    for (const f of list) {
      if (!isAcceptedDoc(f.name)) toast.error(`${f.name}: only PDF, Word, Markdown or text files`);
      else if (f.size > MAX_DOC_BYTES) toast.error(`${f.name} is larger than 25 MB`);
      else if (!f.size) toast.error(`${f.name} is empty`);
      else valid.push(f);
    }
    if (!valid.length) return;
    resetEditor();
    setUploadingNames(valid.map((f) => f.name));
    let lastId: number | null = null;
    let ok = 0;
    for (const f of valid) {
      const form = new FormData();
      form.append("file", f, f.name);
      try {
        const res = await uploadDocument({ projectId, form }).unwrap();
        lastId = res.data.id;
        ok++;
      } catch (err) {
        toast.error(errMsg(err, `Couldn't upload ${f.name}`));
      } finally {
        setUploadingNames((names) => names.filter((n) => n !== f.name));
      }
    }
    setUploadingNames([]);
    if (ok) {
      toast.success(ok === 1 ? "Document uploaded" : `${ok} documents uploaded`);
      if (lastId) setParams({ project: String(projectId), article: String(lastId) });
    }
  };

  const openFilePicker = () => {
    if (!okToLeaveEditor()) return;
    fileInputRef.current?.click();
  };

  const hasFiles = (e: React.DragEvent) => [...(e.dataTransfer?.types || [])].includes("Files");

  const remove = async (a: KbArticle) => {
    if (!projectId) return;
    if (!(await confirmDelete({ itemName: `"${a.title}"` }))) return;
    try {
      await deleteArticle({ id: a.id, projectId }).unwrap();
      toast.success("Article deleted");
      setParams({ project: String(projectId) });
    } catch (err) {
      toast.error(errMsg(err, "Couldn't delete the article"));
    }
  };

  const runPdf = async (which: "all" | number, list: KbArticle[], fileTitle?: string) => {
    if (!project || pdfBusy) return;
    if (!list.length) {
      toast.info("This project has no articles to download yet");
      return;
    }
    setPdfBusy(which);
    try {
      await downloadAsPdf(project.title, list, fileTitle);
    } catch (err) {
      console.error("PDF export failed", err);
      toast.error("Couldn't create the PDF");
    } finally {
      setPdfBusy(null);
    }
  };

  const downloadAllWord = () => {
    if (!project) return;
    if (!articles.length) {
      toast.info("This project has no articles to download yet");
      return;
    }
    downloadAsWord(project.title, articles);
  };

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return q ? projects.filter((p) => p.title.toLowerCase().includes(q)) : projects;
  }, [projects, projectSearch]);

  const filteredArticles = useMemo(() => {
    const q = articleSearch.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.file?.name || "").toLowerCase().includes(q) ||
        plainTextExcerpt(a.content, 100000).toLowerCase().includes(q),
    );
  }, [articles, articleSearch]);

  /* leave document full screen when switching article / mode */
  useEffect(() => {
    setDocFull(false);
  }, [articleId, projectId, mode]);

  const safeArticleHtml = useMemo(() => (article ? sanitizeHtml(article.content) : ""), [article]);

  /* ---------- render ---------- */

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ===== projects ===== */}
        <aside className={`${fullscreen ? "hidden" : ""} w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-gray-100 p-4 lg:sticky lg:top-4`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary-20 text-primary">
              <BookOpen size={18} />
            </span>
            <div>
              <h1 className="text-base font-semibold text-black-80 leading-tight">Knowledge base</h1>
              <p className="text-[11.5px] text-black-50">Documentation for every project</p>
            </div>
          </div>
          <label className="group flex items-center gap-2 h-9 px-3 mb-3 rounded-xl border border-gray-200 bg-[#fafafa]">
            <Search size={14} className="text-gray-400 group-focus-within:text-primary shrink-0" />
            <input
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Find project…"
              className="w-full bg-transparent outline-none text-sm text-black-80 placeholder:text-gray-400"
            />
          </label>
          {projLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : filteredProjects.length === 0 ? (
            <p className="text-xs text-black-50 text-center py-6">
              {projects.length ? "No projects match" : "You're not on any project yet"}
            </p>
          ) : (
            <ul className="space-y-1 max-h-[60vh] lg:max-h-[calc(100vh-260px)] overflow-y-auto -mx-1 px-1">
              {filteredProjects.map((p) => {
                const active = p.id === projectId;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => selectProject(p.id)}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        active ? "bg-primary-20" : "hover:bg-gray-50"
                      }`}
                    >
                      <ProjectLogo title={p.title} url={p.logo_url} size={32} />
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm truncate ${active ? "font-semibold text-primary" : "font-medium text-black-80"}`}>
                          {p.title}
                        </span>
                        <span className="block text-[11px] text-black-50">
                          {p.article_count ? `${p.article_count} ${p.article_count === 1 ? "article" : "articles"}` : "No docs yet"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* ===== project docs ===== */}
        <section
          className={
            fullscreen
              ? "fixed inset-0 z-[1000] bg-white overflow-y-auto"
              : "relative flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-100"
          }
          onDragOver={(e) => {
            if (!project || mode !== "view" || !hasFiles(e)) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            if (!dragOver) setDragOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
          }}
          onDrop={(e) => {
            if (!project || mode !== "view" || !hasFiles(e)) return;
            e.preventDefault();
            setDragOver(false);
            uploadDocs([...e.dataTransfer.files]);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_DOC_INPUT}
            className="hidden"
            onChange={(e) => {
              const files = [...(e.target.files || [])];
              e.target.value = "";
              uploadDocs(files);
            }}
          />
          {dragOver && (
            <div className="pointer-events-none absolute inset-2 z-30 rounded-2xl border-2 border-dashed border-primary bg-primary-20/80 grid place-items-center">
              <div className="text-center">
                <Upload size={28} className="mx-auto text-primary mb-2" />
                <p className="text-sm font-semibold text-primary">Drop to upload to {project?.title}</p>
                <p className="text-xs text-black-50 mt-0.5">PDF, Word (.docx), Markdown (.md) or text · max 25 MB</p>
              </div>
            </div>
          )}
          {!project ? (
            <div className="flex flex-col items-center text-center py-24 px-6">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary-20 text-primary mb-3">
                <BookOpen size={22} />
              </span>
              <p className="text-sm font-semibold text-black-80">
                {projLoading ? "Loading projects…" : projects.length ? "Pick a project" : "No projects available"}
              </p>
            </div>
          ) : (
            <>
              {/* header */}
              <div
                className={`flex flex-wrap items-center gap-3 justify-between px-5 py-4 border-b border-gray-100 ${
                  fullscreen ? "sticky top-0 bg-white z-20" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ProjectLogo title={project.title} url={project.logo_url} size={40} />
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-black-80 truncate">{project.title}</h2>
                    <p className="text-xs text-black-50">
                      {articles.length} {articles.length === 1 ? "article" : "articles"}
                      {project.last_updated ? ` · updated ${formatDate(project.last_updated)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowList((v) => !v)}
                    title={showList ? "Hide article list" : "Show article list"}
                    className="hidden md:grid place-items-center w-9 h-9 rounded-xl border border-gray-200 text-black-50 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    {showList ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                  </button>
                  <button
                    onClick={() => setFullscreen((v) => !v)}
                    title={fullscreen ? "Exit full screen (Esc)" : "Full screen"}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-sm font-medium text-black-80 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    {fullscreen ? "Exit" : "Full screen"}
                  </button>
                  <ShareMenu
                    title={`${project.title} — Knowledge base`}
                    url={kbShareUrl(project.id)}
                    getPdf={() => {
                      if (!articles.length) return Promise.reject(new Error("No articles"));
                      return buildPdfFile(project.title, articles);
                    }}
                  />
                  <button
                    onClick={() => runPdf("all", articles)}
                    disabled={!!pdfBusy}
                    title="Download all articles as one PDF"
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-sm font-medium text-black-80 hover:border-primary hover:text-primary disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {pdfBusy === "all" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                    {pdfBusy === "all" ? "Preparing…" : "Download PDF"}
                  </button>
                  <button
                    onClick={downloadAllWord}
                    title="Download all articles as a Word document"
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-sm font-medium text-black-50 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    <FileText size={15} /> Word
                  </button>
                  <button
                    onClick={openFilePicker}
                    disabled={!!uploadingNames.length}
                    title="Upload PDF, Word or Markdown files (or drag them here)"
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-primary text-sm font-semibold text-primary hover:bg-primary-20 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {uploadingNames.length ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {uploadingNames.length ? "Uploading…" : "Upload file"}
                  </button>
                  <button
                    onClick={startNew}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
                  >
                    <Plus size={15} /> New article
                  </button>
                </div>
              </div>

              <div className={`flex flex-col md:flex-row ${fullscreen ? "min-h-[calc(100vh-73px)]" : "min-h-[520px]"}`}>
                {/* article list */}
                <div
                  className={`${showList ? "" : "md:hidden"} md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 p-3 ${
                    fullscreen ? "md:sticky md:top-[73px] md:self-start" : ""
                  }`}
                >
                  <label className="group flex items-center gap-2 h-9 px-3 mb-2 rounded-xl border border-gray-200 bg-[#fafafa]">
                    <Search size={14} className="text-gray-400 group-focus-within:text-primary shrink-0" />
                    <input
                      value={articleSearch}
                      onChange={(e) => setArticleSearch(e.target.value)}
                      placeholder="Search docs…"
                      className="w-full bg-transparent outline-none text-sm text-black-80 placeholder:text-gray-400"
                    />
                  </label>
                  {artLoading ? (
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-50 animate-pulse" />)}
                    </div>
                  ) : (
                    <ul className="space-y-1 max-h-[40vh] md:max-h-[calc(100vh-300px)] overflow-y-auto">
                      {uploadingNames.map((n) => (
                        <li key={`up-${n}`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 text-sm text-black-50">
                          <Loader2 size={13} className="animate-spin text-primary shrink-0" />
                          <span className="truncate">{n}</span>
                        </li>
                      ))}
                      {mode === "new" && (
                        <li className="px-3 py-2 rounded-xl bg-primary-20 text-sm font-semibold text-primary truncate">
                          {draftTitle.trim() || "Untitled article"}
                        </li>
                      )}
                      {filteredArticles.map((a) => {
                        const active = a.id === articleId && mode !== "new";
                        return (
                          <li key={a.id}>
                            <button
                              onClick={() => selectArticle(a.id)}
                              className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                                active ? "bg-primary-20" : "hover:bg-gray-50"
                              }`}
                            >
                              <span className={`flex items-center gap-1.5 text-sm truncate ${active ? "font-semibold text-primary" : "font-medium text-black-80"}`}>
                                {a.file ? (
                                  <FileBadge ext={a.file.ext || a.file.name} size={18} />
                                ) : (
                                  <FileText size={13} className="shrink-0 opacity-70" />
                                )}
                                <span className="truncate">{a.title}</span>
                              </span>
                              <span className="block text-[11px] text-black-50 truncate mt-0.5">
                                {a.lastEditedBy?.username || a.author?.username || "—"} · {formatDate(a.updatedAt)}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                      {!filteredArticles.length && mode !== "new" && !uploadingNames.length && (
                        <li className="text-xs text-black-50 text-center py-8 px-2">
                          {articles.length ? "No articles match" : "No documentation yet."}
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* reader / editor */}
                <div className={`flex-1 min-w-0 p-5 ${fullscreen ? "md:px-10 md:py-8" : ""}`}>
                  <div className={fullscreen ? "max-w-5xl mx-auto" : ""}>
                  {mode !== "view" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                      <input
                        autoFocus={mode === "new"}
                        value={draftTitle}
                        onChange={(e) => {
                          dirtyRef.current = true;
                          setDraftTitle(e.target.value);
                        }}
                        maxLength={200}
                        placeholder="Article title, e.g. Deployment guide"
                        className="flex-1 min-w-0 h-12 px-4 rounded-xl border border-gray-200 text-lg font-semibold text-black-80 outline-none focus:border-primary placeholder:font-normal placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setFullscreen((v) => !v)}
                        title={fullscreen ? "Exit full window (Esc)" : "Write in full window"}
                        className="shrink-0 inline-flex items-center gap-1.5 h-12 px-3.5 rounded-xl border border-gray-200 text-sm font-medium text-black-80 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        <span className="hidden sm:inline">{fullscreen ? "Exit full window" : "Full window"}</span>
                      </button>
                      </div>
                      <RichEditor
                        key={editorKey}
                        tall={fullscreen}
                        initialHtml={draftHtml}
                        placeholder={
                          mode === "edit" && article?.file
                            ? `Optional notes shown above ${article.file.name}…`
                            : "Write the documentation — setup steps, credentials location, how things work, decisions…"
                        }
                        onChange={(html) => {
                          dirtyRef.current = true;
                          setDraftHtml(html);
                        }}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-black-50 hidden sm:block">
                          Tip: paste or drag images straight into the editor · Ctrl+S to save
                        </span>
                        <div className="flex gap-2 ml-auto">
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-black-80 hover:bg-gray-50 cursor-pointer"
                          >
                            <X size={15} /> Cancel
                          </button>
                          <button
                            onClick={save}
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-105 disabled:opacity-60 cursor-pointer"
                          >
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                            {mode === "new" ? "Publish" : "Save changes"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : article ? (
                    <article>
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                        <h3 className="text-2xl font-bold text-black-80 break-words min-w-0">{article.title}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={startEdit}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-primary hover:bg-primary-20 cursor-pointer"
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            onClick={() => (article.file ? setDocFull(true) : setFullscreen((v) => !v))}
                            title={
                              article.file
                                ? "View document full screen"
                                : fullscreen
                                  ? "Exit full screen (Esc)"
                                  : "Read in full screen"
                            }
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-black-50 hover:text-primary hover:bg-gray-50 cursor-pointer"
                          >
                            {!article.file && fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                            {!article.file && fullscreen ? "Exit" : "Full screen"}
                          </button>
                          <ShareMenu
                            compact
                            title={`${article.title} — ${project.title}`}
                            url={kbShareUrl(project.id, article.id)}
                            getPdf={() => buildPdfFile(project.title, [article], article.title)}
                          />
                          {!article.file && (
                          <button
                            onClick={() => runPdf(article.id, [article], article.title)}
                            disabled={!!pdfBusy}
                            title="Download this article as PDF"
                            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold text-black-50 hover:text-primary hover:bg-gray-50 disabled:opacity-60 cursor-pointer"
                          >
                            {pdfBusy === article.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} PDF
                          </button>
                          )}
                          {article.canDelete && (
                            <button
                              onClick={() => remove(article)}
                              title="Delete article"
                              className="grid place-items-center w-8 h-8 rounded-lg text-black-50 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-black-50 mb-5 pb-4 border-b border-gray-100">
                        {article.author ? `Written by ${article.author.username}` : "Written"} · {formatDate(article.createdAt)}
                        {article.updatedAt !== article.createdAt && (
                          <>
                            {" "}· Edited {formatDate(article.updatedAt)}
                            {article.lastEditedBy ? ` by ${article.lastEditedBy.username}` : ""}
                          </>
                        )}
                      </p>
                      {safeArticleHtml && !isHtmlEmpty(safeArticleHtml) ? (
                        <div
                          className={`kb-prose ${article.file ? "mb-5" : ""}`}
                          dangerouslySetInnerHTML={{ __html: safeArticleHtml }}
                        />
                      ) : (
                        !article.file && (
                          <p className="text-sm text-black-50 italic">This article is empty. Click Edit to add content.</p>
                        )
                      )}
                      {article.file && (
                        <FilePreview
                          key={article.file.id}
                          articleId={article.id}
                          file={article.file}
                          tall={fullscreen}
                          expanded={docFull}
                          onCloseExpanded={closeDocFull}
                        />
                      )}
                    </article>
                  ) : (
                    <div className="flex flex-col items-center text-center py-20">
                      {artFetching ? (
                        <Loader2 size={22} className="animate-spin text-primary" />
                      ) : (
                        <>
                          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary-20 text-primary mb-3">
                            <FileText size={22} />
                          </span>
                          <p className="text-sm font-semibold text-black-80">No documentation for {project.title} yet</p>
                          <p className="text-xs text-black-50 mt-1 mb-4 max-w-xs">
                            Add setup notes, guides, credentials locations, decisions — anything the team should know.
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            <button
                              onClick={startNew}
                              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer"
                            >
                              <Plus size={15} /> Write the first article
                            </button>
                            <button
                              onClick={openFilePicker}
                              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary-20 cursor-pointer"
                            >
                              <Upload size={15} /> Upload a file
                            </button>
                          </div>
                          <p className="text-[11px] text-black-50 mt-3">or drag PDF, Word or Markdown files here</p>
                        </>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default KnowledgeBase;

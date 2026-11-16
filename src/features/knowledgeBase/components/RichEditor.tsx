/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  RemoveFormatting,
  Underline,
} from "lucide-react";
import { toast } from "react-toastify";
import { useUploadFileMutation } from "../../../shared/api/sharedApi";
import { getImageUrl } from "../../../utils/utils";
import { sanitizeHtml } from "../kbUtils";

interface Props {
  /** Initial HTML. The editor is uncontrolled — remount (change `key`) to load another article. */
  initialHtml: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Fill the window height (full-window mode). */
  tall?: boolean;
}

const ToolBtn: React.FC<{
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, active, disabled, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    // mousedown + preventDefault keeps the text selection inside the editor
    onMouseDown={(e) => {
      e.preventDefault();
      if (!disabled) onClick();
    }}
    className={`grid place-items-center w-8 h-8 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
      active ? "bg-primary-20 text-primary" : "text-black-80 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px h-5 bg-gray-200 mx-1" />;

const RichEditor: React.FC<Props> = ({ initialHtml, onChange, placeholder, tall }) => {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();
  const [active, setActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = sanitizeHtml(initialHtml || "");
    // only on mount — the editor owns its DOM afterwards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => ref.current && onChange(ref.current.innerHTML);

  const exec = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    emit();
    refreshActive();
  };

  function isActive(cmd: string) {
    try {
      const sel = window.getSelection();
      if (!sel || !ref.current || !sel.anchorNode || !ref.current.contains(sel.anchorNode)) return false;
      return document.queryCommandState(cmd);
    } catch {
      return false;
    }
  }

  function blockIs(tag: string) {
    try {
      const sel = window.getSelection();
      if (!sel || !ref.current || !sel.anchorNode || !ref.current.contains(sel.anchorNode)) return false;
      return String(document.queryCommandValue("formatBlock")).toLowerCase() === tag;
    } catch {
      return false;
    }
  }

  /** Toolbar highlight state — computed in event handlers, never during render. */
  function refreshActive() {
    setActive({
      bold: isActive("bold"),
      italic: isActive("italic"),
      underline: isActive("underline"),
      ul: isActive("insertUnorderedList"),
      ol: isActive("insertOrderedList"),
      h2: blockIs("h2"),
      h3: blockIs("h3"),
      blockquote: blockIs("blockquote"),
      pre: blockIs("pre"),
    });
  }

  const toggleBlock = (tag: string) => exec("formatBlock", blockIs(tag) ? "<p>" : `<${tag}>`);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const addLink = () => {
    saveSelection();
    const url = window.prompt("Link URL (https://…)");
    if (!url) return;
    const href = /^(https?:|mailto:|tel:|\/)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.toString()) exec("createLink", href);
    else exec("insertHTML", `<a href="${href.replace(/"/g, "&quot;")}">${href.replace(/</g, "&lt;")}</a>&nbsp;`);
  };

  const uploadImages = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    for (const file of images) {
      const form = new FormData();
      form.append("files", file);
      try {
        const res: any = await uploadFile(form).unwrap();
        const url = getImageUrl(res?.[0]?.url);
        if (!url) throw new Error("No URL returned");
        restoreSelection();
        exec("insertHTML", `<img src="${url.replace(/"/g, "&quot;")}" alt="${file.name.replace(/"/g, "")}" /><p><br></p>`);
        saveSelection();
      } catch (err) {
        console.error("KB image upload failed", err);
        toast.error(`Couldn't upload ${file.name}`);
      }
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const files = [...(e.clipboardData?.files || [])];
    if (files.some((f) => f.type.startsWith("image/"))) {
      e.preventDefault();
      saveSelection();
      uploadImages(files);
      return;
    }
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      document.execCommand("insertHTML", false, sanitizeHtml(html));
      emit();
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const files = [...(e.dataTransfer?.files || [])];
    if (files.some((f) => f.type.startsWith("image/"))) {
      e.preventDefault();
      saveSelection();
      uploadImages(files);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Tab inside lists = indent / outdent
    if (e.key === "Tab" && (isActive("insertUnorderedList") || isActive("insertOrderedList"))) {
      e.preventDefault();
      exec(e.shiftKey ? "outdent" : "indent");
    }
  };

  useEffect(() => {
    const onSel = () => refreshActive();
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white focus-within:border-primary transition-colors">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
        <ToolBtn title="Heading" active={active.h2} onClick={() => toggleBlock("h2")}><Heading2 size={16} /></ToolBtn>
        <ToolBtn title="Sub-heading" active={active.h3} onClick={() => toggleBlock("h3")}><Heading3 size={16} /></ToolBtn>
        <Divider />
        <ToolBtn title="Bold (Ctrl+B)" active={active.bold} onClick={() => exec("bold")}><Bold size={16} /></ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" active={active.italic} onClick={() => exec("italic")}><Italic size={16} /></ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" active={active.underline} onClick={() => exec("underline")}><Underline size={16} /></ToolBtn>
        <Divider />
        <ToolBtn title="Bulleted list" active={active.ul} onClick={() => exec("insertUnorderedList")}><List size={16} /></ToolBtn>
        <ToolBtn title="Numbered list" active={active.ol} onClick={() => exec("insertOrderedList")}><ListOrdered size={16} /></ToolBtn>
        <ToolBtn title="Quote / note" active={active.blockquote} onClick={() => toggleBlock("blockquote")}><Quote size={16} /></ToolBtn>
        <ToolBtn title="Code block" active={active.pre} onClick={() => toggleBlock("pre")}><Code2 size={16} /></ToolBtn>
        <ToolBtn title="Divider line" onClick={() => exec("insertHorizontalRule")}><Minus size={16} /></ToolBtn>
        <Divider />
        <ToolBtn title="Insert link" onClick={addLink}><Link2 size={16} /></ToolBtn>
        <ToolBtn
          title="Insert image"
          disabled={uploading}
          onClick={() => {
            saveSelection();
            fileRef.current?.click();
          }}
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </ToolBtn>
        <ToolBtn title="Clear formatting" onClick={() => exec("removeFormat")}><RemoveFormatting size={16} /></ToolBtn>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = [...(e.target.files || [])];
            e.target.value = "";
            uploadImages(files);
          }}
        />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder || "Start writing…"}
        onInput={emit}
        onBlur={() => {
          saveSelection();
          emit();
        }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onPaste={onPaste}
        onDrop={onDrop}
        onKeyDown={onKeyDown}
        className={`kb-prose kb-editable ${tall ? "min-h-[calc(100vh-270px)]" : "min-h-[360px]"} px-5 py-4 outline-none`}
      />
    </div>
  );
};

export default RichEditor;

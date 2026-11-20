import React from "react";
import { FileText, FileSpreadsheet, File as FileIcon } from "lucide-react";
import {
  type AttachmentKind,
  getAttachmentKind,
  getFileExtension,
} from "../utils/taskAttachmentUtils";

const KIND_STYLES: Record<AttachmentKind, { bg: string; fg: string; label: string }> = {
  pdf: { bg: "bg-rose-50", fg: "text-rose-600", label: "PDF" },
  word: { bg: "bg-blue-50", fg: "text-blue-600", label: "DOC" },
  excel: { bg: "bg-emerald-50", fg: "text-emerald-600", label: "XLS" },
  image: { bg: "bg-slate-100", fg: "text-slate-500", label: "IMG" },
  file: { bg: "bg-slate-100", fg: "text-slate-500", label: "FILE" },
};

interface Props {
  name: string;
  mime?: string;
  url?: string;
  /** "sm" for compact chips (e.g. kanban), default fills its parent tile. */
  className?: string;
}

/** Non-image attachment preview: coloured file icon + extension + file name. */
export const AttachmentFileTile: React.FC<Props> = ({ name, mime, url, className = "" }) => {
  const kind = getAttachmentKind({ mime, name, url });
  const style = KIND_STYLES[kind];
  const ext = (getFileExtension(name) || getFileExtension(url) || style.label).toUpperCase();
  const Icon = kind === "excel" ? FileSpreadsheet : kind === "file" ? FileIcon : FileText;

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-1 px-1.5 ${style.bg} ${className}`}
      title={name}
    >
      <div className="flex items-center gap-1">
        <Icon className={`w-5 h-5 ${style.fg}`} />
        <span className={`text-[9px] font-bold tracking-wide ${style.fg}`}>{ext}</span>
      </div>
      <span className="w-full text-center text-[10px] leading-tight text-slate-600 font-medium truncate">
        {name}
      </span>
    </div>
  );
};

export default AttachmentFileTile;

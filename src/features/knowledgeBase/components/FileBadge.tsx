import React from "react";
import { fileKind } from "../kbUtils";

const STYLE: Record<string, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "#E5484D" },
  docx: { label: "DOC", color: "#2B6CE0" },
  doc: { label: "DOC", color: "#2B6CE0" },
  markdown: { label: "MD", color: "#7C3AED" },
  text: { label: "TXT", color: "#64748B" },
  other: { label: "FILE", color: "#64748B" },
};

/** Small coloured file-type tile (PDF / DOC / MD / TXT). */
const FileBadge: React.FC<{ ext: string; size?: number }> = ({ ext, size = 20 }) => {
  const s = STYLE[fileKind(ext)] || STYLE.other;
  return (
    <span
      style={{
        width: size,
        height: size,
        background: `${s.color}1a`,
        color: s.color,
        fontSize: Math.max(7, size * 0.3),
      }}
      className="rounded-md grid place-items-center font-bold shrink-0 tracking-tight leading-none"
    >
      {s.label}
    </span>
  );
};

export default FileBadge;

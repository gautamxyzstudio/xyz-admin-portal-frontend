/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IUploadedAttachment {
  id: number;
  name: string;
  url: string;
  size?: number;
  mime?: string;
  previewUrl?: string;
  isUploading?: boolean;
}

/**
 * Extracts normalized attachment objects from various Strapi response shapes.
 */
export const extractTaskAttachments = (data: any): IUploadedAttachment[] => {
  if (!data) return [];

  // If already array of objects
  if (Array.isArray(data)) {
    return data
      .filter(Boolean)
      .map((item) => {
        if (typeof item === "number" || typeof item === "string") {
          return { id: Number(item), name: `attachment-${item}`, url: "" };
        }
        return {
          id: item.id,
          name: item.name || item.attributes?.name || "image",
          url: item.url || item.attributes?.url || "",
          size: item.size || item.attributes?.size,
          mime: item.mime || item.attributes?.mime,
        };
      })
      .filter((att) => att.url || att.id);
  }

  // Strapi v4 wrapper { data: [...] }
  if (data?.data) {
    return extractTaskAttachments(data.data);
  }

  // Single media object
  if (typeof data === "object" && data.id) {
    return [
      {
        id: data.id,
        name: data.name || data.attributes?.name || "image",
        url: data.url || data.attributes?.url || "",
        size: data.size || data.attributes?.size,
        mime: data.mime || data.attributes?.mime,
      },
    ];
  }

  return [];
};

// Format bytes into human readable string (e.g. 1.2 MB)
export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};


/* ---------- Allowed attachment types (images + PDF / Word / Excel) ---------- */

export type AttachmentKind = "image" | "pdf" | "word" | "excel" | "file";

const DOC_EXTENSIONS: Record<string, Exclude<AttachmentKind, "image" | "file">> = {
  pdf: "pdf",
  doc: "word",
  docx: "word",
  xls: "excel",
  xlsx: "excel",
  csv: "excel",
};

const DOC_MIMES: Record<string, Exclude<AttachmentKind, "image" | "file">> = {
  "application/pdf": "pdf",
  "application/msword": "word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "word",
  "application/vnd.ms-excel": "excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
  "text/csv": "excel",
};

/** Value for <input type="file" accept="..."> */
export const ATTACHMENT_ACCEPT = [
  "image/*",
  ...Object.keys(DOC_EXTENSIONS).map((ext) => `.${ext}`),
  ...Object.keys(DOC_MIMES),
].join(",");

/** Max size for a single attachment (bytes). */
export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25 MB

export const getFileExtension = (nameOrUrl?: string): string => {
  if (!nameOrUrl) return "";
  const clean = nameOrUrl.split("?")[0].split("#")[0];
  const dot = clean.lastIndexOf(".");
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : "";
};

/** Works out what kind of attachment this is from its mime type, falling back to the file extension. */
export const getAttachmentKind = (att: {
  mime?: string;
  type?: string;
  name?: string;
  url?: string;
}): AttachmentKind => {
  const mime = (att.mime || att.type || "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (DOC_MIMES[mime]) return DOC_MIMES[mime];

  const ext = getFileExtension(att.name) || getFileExtension(att.url);
  if (/^(png|jpe?g|gif|webp|svg|avif|bmp)$/.test(ext)) return "image";
  return DOC_EXTENSIONS[ext] || "file";
};

export const isImageAttachment = (att: Parameters<typeof getAttachmentKind>[0]) =>
  getAttachmentKind(att) === "image";

/** True for images, PDF, Word (.doc/.docx) and Excel (.xls/.xlsx/.csv). */
export const isAllowedAttachmentFile = (file: File): boolean =>
  getAttachmentKind({ type: file.type, name: file.name }) !== "file";

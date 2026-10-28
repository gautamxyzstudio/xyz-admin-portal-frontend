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


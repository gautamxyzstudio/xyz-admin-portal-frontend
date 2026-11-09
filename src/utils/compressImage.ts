/**
 * Client-side photo compression before upload.
 * - Only touches JPEG / PNG / WebP / BMP photos (GIF, SVG, PDFs, videos etc. are left as-is)
 * - Resizes so the longest side is at most MAX_DIMENSION px
 * - Re-encodes as JPEG (or WebP for images with transparency) at QUALITY
 * - Keeps the original file if compression would not make it smaller
 */

const MAX_DIMENSION = 1920;
const QUALITY = 0.8;
const SKIP_BELOW_BYTES = 200 * 1024; // already small enough
const COMPRESSIBLE = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });

const hasTransparency = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  try {
    const data = ctx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < data.length; i += 4 * 16) {
      if (data[i] < 255) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
};

const renameExt = (name: string, ext: string) =>
  name.includes(".") ? name.replace(/\.[^.]+$/, `.${ext}`) : `${name}.${ext}`;

export const compressImage = async (file: File): Promise<File> => {
  if (!(file instanceof File)) return file;
  if (!COMPRESSIBLE.includes(file.type.toLowerCase())) return file;

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    if (scale === 1 && file.size < SKIP_BELOW_BYTES) return file;

    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const transparent = file.type !== "image/jpeg" && hasTransparency(ctx, width, height);
    const outType = transparent ? "image/webp" : "image/jpeg";

    if (!transparent) {
      // flatten onto white so JPEG has no black background
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outType, QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], renameExt(file.name, transparent ? "webp" : "jpg"), {
      type: outType,
      lastModified: Date.now(),
    });
  } catch {
    return file; // never block an upload because compression failed
  }
};

/** Returns a new FormData with every photo in it compressed. */
export const compressFormDataImages = async (formData: FormData): Promise<FormData> => {
  const out = new FormData();
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const compressed = await compressImage(value);
      out.append(key, compressed, compressed.name);
    } else {
      out.append(key, value);
    }
  }
  return out;
};

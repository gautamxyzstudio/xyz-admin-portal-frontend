/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect } from "react";
import {
  Paperclip,
  Image as ImageIcon,
  X,
  Trash2,
  Eye,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { useUploadFileMutation } from "../../../shared/api/sharedApi";
import { getImageUrl } from "../../../utils/utils";
import {
  type IUploadedAttachment,
  formatFileSize,
} from "../utils/taskAttachmentUtils";

export type { IUploadedAttachment };

interface TaskAttachmentUploadProps {
  attachments: IUploadedAttachment[];
  onChange: (attachments: IUploadedAttachment[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  disabled?: boolean;
  maxFiles?: number;
  className?: string;
  label?: string;
  helperText?: string;
}

export const TaskAttachmentUpload: React.FC<TaskAttachmentUploadProps> = ({
  attachments,
  onChange,
  onUploadingChange,
  disabled = false,
  maxFiles = 10,
  className = "",
  label = "Attachments",
  helperText = "Drop images here, choose files, or paste a screenshot into the description.",
}) => {
  const [uploadFile] = useUploadFileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeUploadsCount, setActiveUploadsCount] = useState(0);
  const [previewImage, setPreviewImage] = useState<IUploadedAttachment | null>(null);

  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  // Sync uploading state with parent component
  useEffect(() => {
    onUploadingChange?.(activeUploadsCount > 0);
  }, [activeUploadsCount, onUploadingChange]);

  const handleProcessFiles = async (files: FileList | File[]) => {
    if (disabledRef.current) return;

    const fileList = Array.from(files);
    if (!fileList.length) return;

    const currentAttachments = attachmentsRef.current;

    // Check max files limit
    if (currentAttachments.length + fileList.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} image attachments.`);
      return;
    }

    // Filter valid images
    const validImageFiles = fileList.filter((file) => {
      const isImg = file.type.startsWith("image/");
      if (!isImg) {
        toast.error(`"${file.name}" is not an image file.`);
      }
      return isImg;
    });

    if (!validImageFiles.length) return;

    // Create temporary placeholder items with blob previews
    const newPendingItems: IUploadedAttachment[] = validImageFiles.map(
      (file, index) => ({
        id: -Date.now() - index, // temporary negative ID
        name: file.name,
        url: "",
        previewUrl: URL.createObjectURL(file),
        size: file.size,
        mime: file.type,
        isUploading: true,
      })
    );

    // Append placeholders immediately for responsive feedback
    let currentList = [...currentAttachments, ...newPendingItems];
    onChange(currentList);
    setActiveUploadsCount((prev) => prev + validImageFiles.length);

    // Upload each file individually
    for (let i = 0; i < validImageFiles.length; i++) {
      const file = validImageFiles[i];
      const placeholder = newPendingItems[i];

      const formData = new FormData();
      formData.append("files", file);

      try {
        const response: any = await uploadFile(formData).unwrap();
        const uploadedMedia = Array.isArray(response) ? response[0] : response;

        if (uploadedMedia?.id) {
          if (placeholder.previewUrl) {
            URL.revokeObjectURL(placeholder.previewUrl);
          }
          currentList = currentList.map((item) => {
            if (item.id === placeholder.id) {
              return {
                id: uploadedMedia.id,
                name: uploadedMedia.name || file.name,
                url: uploadedMedia.url || "",
                size: uploadedMedia.size || file.size,
                mime: uploadedMedia.mime || file.type,
                isUploading: false,
              };
            }
            return item;
          });
          onChange(currentList);
        } else {
          throw new Error("Upload response missing file ID");
        }
      } catch (err: any) {
        console.error("Attachment upload failed:", err);
        toast.error(`Failed to upload "${file.name}"`);
        currentList = currentList.filter((item) => item.id !== placeholder.id);
        onChange(currentList);
        if (placeholder.previewUrl) {
          URL.revokeObjectURL(placeholder.previewUrl);
        }
      } finally {
        setActiveUploadsCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleRemove = (id: number) => {
    if (disabled) return;
    const itemToRemove = attachments.find((a) => a.id === id);
    if (itemToRemove?.previewUrl) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }
    onChange(attachments.filter((a) => a.id !== id));
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Support paste screenshot anywhere into modal
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabledRef.current) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const ext = file.type.split("/")[1] || "png";
            const namedFile = new File(
              [file],
              `screenshot-${Date.now()}.${ext}`,
              { type: file.type }
            );
            imageFiles.push(namedFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        handleProcessFiles(imageFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Title / Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">
          {label}
        </label>
        {attachments.length > 0 && (
          <span className="text-xs text-slate-400 font-medium">
            {attachments.length} / {maxFiles}
          </span>
        )}
      </div>

      {/* Main dropzone & attachments container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full min-h-[96px] rounded-2xl border border-dashed p-3 transition-all flex flex-wrap items-center gap-3 ${
          disabled
            ? "bg-slate-50/60 border-slate-200 opacity-60 cursor-not-allowed"
            : isDragOver
            ? "border-primary bg-orange-50/50 ring-2 ring-primary/20"
            : "border-slate-200/90 bg-[#fafafa] hover:border-slate-300"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled || attachments.length >= maxFiles}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleProcessFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />

        {/* "Add photo" Button / Tile */}
        {attachments.length < maxFiles && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-24 h-20 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all cursor-pointer text-slate-600 shadow-2xs shrink-0 group focus:outline-hidden"
          >
            <Paperclip className="w-4.5 h-4.5 text-slate-500 group-hover:text-slate-700 transition-colors mb-1.5" />
            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800">
              Add photo
            </span>
          </button>
        )}

        {/* Uploaded attachments thumbnails */}
        {attachments.map((att) => {
          const displayUrl = att.previewUrl || getImageUrl(att.url);

          return (
            <div
              key={att.id}
              className="group relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-all shrink-0"
            >
              {displayUrl ? (
                <img
                  src={displayUrl}
                  alt={att.name}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <ImageIcon className="text-slate-300" size={20} />
                </div>
              )}

              {/* Uploading Spinner Overlay */}
              {att.isUploading && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-2xs flex flex-col items-center justify-center gap-1 z-10 text-white">
                  <CircularProgress size={16} sx={{ color: "#ffffff" }} />
                  <span className="text-[9px] font-medium tracking-tight">
                    Uploading...
                  </span>
                </div>
              )}

              {/* Hover Actions Overlay */}
              {!att.isUploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(att);
                    }}
                    title="Preview Image"
                    className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white hover:text-primary transition-all cursor-pointer shadow-xs"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(att.id);
                    }}
                    title="Remove Attachment"
                    className="p-1.5 rounded-lg bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-xs"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper text below container */}
      {helperText && (
        <p className="text-xs text-slate-500">
          {helperText}
        </p>
      )}

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-9999 bg-black/25 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150"
          style={{ zIndex: 9999 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <span className="text-xs font-bold text-slate-800 truncate max-w-md">
                {previewImage.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Image display */}
            <div className="p-2.5 flex items-center justify-center overflow-y-auto overflow-x-hidden max-h-[58vh] bg-slate-50/40 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <img
                src={previewImage.previewUrl || getImageUrl(previewImage.url)}
                alt={previewImage.name}
                className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-2xs"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500">
              <span>{formatFileSize(previewImage.size)}</span>
              {previewImage.url && (
                <a
                  href={getImageUrl(previewImage.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Open original in new tab
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

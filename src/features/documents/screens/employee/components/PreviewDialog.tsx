import LinearGradient from "../../../../../components/LinearGradient/LinearGradient";
import type { IDocumentResponse } from "../../../documents.types";

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  document: IDocumentResponse | null;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onClose,
  document,
}) => {
  if (!open || !document) return null;

  const file = document.attributes.document.data.attributes;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

   

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const fileUrl = `${file.url}`;

  return (
    <div className="fixed inset-0 z-9999 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg">
        {/* -------- Header -------- */}
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-lg font-semibold">
            {document.attributes.documentName}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <LinearGradient />

        {/* -------- Content -------- */}
        <div className="p-6 text-center">
          {file.mime.startsWith("image/") ? (
            <img
              src={fileUrl}
              alt={document.attributes.documentName}
              className="max-h-40 mx-auto  object-contain rounded"
            />
          ) : (
            <div className="py-10">
              <p className="text-gray-600 mb-4">
                Preview not available for this file type
              </p>

              <button
                onClick={() => window.open(fileUrl, "_blank")}
                className="px-5 py-2 border rounded-lg text-[#FF7312] border-[#FF7312] hover:bg-[#FF7312] hover:text-white transition"
              >
                Download to View
              </button>
            </div>
          )}

          {/* -------- File Details -------- */}
          <div className="mt-6 text-left text-sm space-y-1">
            <p>
              <span className="font-medium">File Name:</span> {file.name}
            </p>
            <p>
              <span className="font-medium">File Type:</span> {file.mime}
            </p>
            <p>
              <span className="font-medium">File Size:</span>{" "}
              {formatFileSize(file.size * 1024)}
            </p>
            <p>
              <span className="font-medium">Uploaded:</span>{" "}
              {formatDate(document.attributes.createdAt)}
            </p>
          </div>
        </div>

        {/* -------- Footer -------- */}
        <LinearGradient />
        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#F7F7F7]   text-[#797571] w-37.5 font-bold"
          >
            Close
          </button>

          <button
            onClick={() => window.open(fileUrl, "_blank")}
            className="px-4 py-2 rounded-lg border text-white bg-primary"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewDialog;

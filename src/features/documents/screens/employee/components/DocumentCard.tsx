
import type { IDocumentResponse } from "../../../documents.types";
import { useDeleteDocumentMutation } from "../../../documentsApi";
import { toast } from "react-toastify";

interface Props {
  document: IDocumentResponse;
  onPreview: (doc: IDocumentResponse) => void;
  canDelete?: boolean;
}

const DocumentCard = ({ document, onPreview, canDelete }: Props) => {
  const [deleteDocument, { isLoading }] = useDeleteDocumentMutation();

  const attrs = document.attributes.document.data.attributes;

  const handleDelete = async () => {
    try {
      await deleteDocument(document.id).unwrap();
      toast.success("Document deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const getIcon = () => {
    if (attrs.mime.startsWith("image")) return "🖼️";
    if (attrs.mime.includes("pdf")) return "📄";
    if (attrs.mime.includes("word")) return "📝";
    if (attrs.mime.includes("excel")) return "📊";
    return "📎";
  };

  return (
    <div className="bg-white rounded-lg p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getIcon()}</span>

        <div>
          <p className="font-medium text-sm">
            {document.attributes.documentName}
          </p>

          <p className="text-xs text-gray-500">
            {attrs.ext.toUpperCase()} • {(attrs.size / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[#FF7312]">
        <button onClick={() => onPreview(document)}>👁</button>
    

        <button
          onClick={() =>
            window.open(
              `${import.meta.env.VITE_API_BASE_URL}${attrs.url}`,
              "_blank"
            )
          }
        >
          ⬇
        </button>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-500"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;

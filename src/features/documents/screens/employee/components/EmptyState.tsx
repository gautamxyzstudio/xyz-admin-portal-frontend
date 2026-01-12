import { Icons } from "../../../../../assets/myAssets/exporter";

interface EmptyStateProps {
  onUploadClick: () => void;
  showUploadButton?: boolean;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onUploadClick,
  showUploadButton,
  subtitle, 
}) => {
  return (
    <div
      style={{
        minHeight: "300px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <img className="h-70 " src={Icons.NO_DATA} alt="" />

      {/* Title */}
      <h3 style={{ marginBottom: "8px" }}>No documents uploaded yet</h3>

      {/* Subtitle */}
      <p style={{ marginBottom: "24px", color: "#666" }}>
        {subtitle || "Upload your first document to get started"}
      </p>

      {/* Button */}
      {showUploadButton && (
        <button
          onClick={onUploadClick}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Upload Document
        </button>
      )}
    </div>
  );
};

export default EmptyState;

import { useState } from "react";
import { useSelector } from "react-redux";
import { userInState } from "../../../auth/authSlice";
import { useGetDocumentsByUserQuery } from "../../documentsApi";
import ActivityIndicator from "../../../../shared/components/activityIndicator/ActivityIndicator";
import {
  UploadDialog,
  PreviewDialog,
  EmptyState,
} from "../employee/components";
import type { IDocumentResponse } from "../../documents.types";
import { Icons } from "../../../../assets/myAssets/exporter";
import CustomButton from "../../../../components/CustomButton/CustomButton";

interface OwnDocsProps {
  userId?: number;
  canDelete?: boolean;
  employeeName?: string;
  CustomClass?: string;
}

const OwnDocs: React.FC<OwnDocsProps> = ({ userId, employeeName }) => {
  const user = useSelector(userInState);

  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [previewDocument, setPreviewDocument] =
    useState<IDocumentResponse | null>(null);

  const effectiveUserId = userId || user?.id;

  const {
    data: documentsData,
    isFetching: isLoading,
    error,
  } = useGetDocumentsByUserQuery(effectiveUserId ?? 0, {
    skip: !effectiveUserId,
  });

  const handlePreviewDocument = (document: IDocumentResponse) => {
    setPreviewDocument(document);
    setOpenPreviewDialog(true);
  };

  /* ---------------- Loading ---------------- */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-75 p-6 bg-white rounded-xl w-full">
        <ActivityIndicator size={80}  />
      </div>
    );
  }

  /* ---------------- Error ---------------- */
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-75 p-6 bg-white rounded-xl w-full">
        <p className="text-red-500 font-medium">
          Failed to load documents. Please try again.
        </p>
      </div>
    );
  }
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (url: string) => {
    const fileUrl = url.startsWith("http")
      ? url
      : `${import.meta.env.VITE_API_BASE_URL}${url}`;

    window.open(fileUrl, "_blank");
  };

  return (
    <div className="p-6 bg-white rounded-xl w-full h-full overflow-scroll scrollbar-hide">
      {/* ---------------- Upload Box  ---------------- */}
      {!userId && (
        <>
          <h3 className="text-2xl font-semibold leading-8">Documents</h3>
          <div className="border border-dashed border-[#787571] rounded-xl p-8 mb-6 mt-4">
            <div className="flex items-center gap-8">
              {/* <img src="/upload-docs.svg" alt="upload" className="w-40" /> */}
              <img src={Icons.UPLOAD_DOCUMENTS} alt="UPLOAD_DOCUMENTS" />

              <div>
                <h3 className="text-lg font-semibold">
                  Choose a file or drag & drop it here
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Supports: PNG, JPG, JPEG, WEBP up to 50MB
                </p>
                <CustomButton
                  onClick={() => setOpenUploadDialog(true)}
                  label="Upload File"
                  buttonStyle="primaryOutline"
                  customStyles="mt-3 "
                />
              </div>
            </div>
          </div>
        </>
      )}
      {/* ---------------- My Documents ---------------- */}
      <h3 className="text-2xl font-semibold leading-8 mb-4 sticky top-0 z-9 bg-white  ">
        {employeeName ? `${employeeName}'s Documents` : "My Documents"}
      </h3>

      {documentsData?.data?.length ? (
        <div className="space-y-3 ">
          {documentsData.data.map((doc: IDocumentResponse) => {
            const file = doc.attributes.document.data.attributes;

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-background rounded-xl px-4 py-3"
              >
                {/* Left */}
                <div className="flex items-center gap-4    relative">
                  <span className="bg-orange-500 text-white text-xs font-semibold px-0.5 py-0.4 rounded absolute top-8 -left-3 ">
                    {file.ext.toUpperCase()}
                  </span>
                  <img className="w-12" src={Icons.FILE} alt="" />

                  <div>
                    <p className="text-sm font-medium">
                      {doc.attributes.documentName}
                    </p>
                    <p className="flex items-center gap-2 text-xs  text-gray-500 mt-1">
                      • {formatFileSize(file.size)}
                      <img src={Icons.TICK} alt="" />
                      Uploaded{" "}
                      {new Date(doc.attributes.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4 text-orange-500">
                  <img
                    className="cursor-pointer"
                    src={Icons.DOWNLOAD}
                    onClick={() => handleDownload(file.url)}
                  />

                  <img
                    className="cursor-pointer"
                    onClick={() => handlePreviewDocument(doc)}
                    src={Icons.VIEW}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          onUploadClick={() => setOpenUploadDialog(true)}
          showUploadButton={!userId}
          subtitle={
            userId ? "No documents found for this employee." : undefined
          }
        />
      )}

      {/* ---------------- Upload Dialog ---------------- */}
      <UploadDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
      />

      {/* ---------------- Preview Dialog ---------------- */}
      <PreviewDialog
        open={openPreviewDialog}
        onClose={() => setOpenPreviewDialog(false)}
        document={previewDocument}
      />
    </div>
  );
};

export default OwnDocs;

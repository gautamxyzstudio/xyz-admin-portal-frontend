import { useState, useRef } from "react";

import { useSelector } from "react-redux";
import { userInState } from "../../../../auth/authSlice";
import { useAddNewDocumentMutation } from "../../../documentsApi";
import { useUploadFileMutation } from "../../../../../shared/api/sharedApi";
import { useSnackBarContext } from "../../../../../wrappers/snackbarContext/useSnackBarContext";
import type { ICustomErrorResponse } from "../../../../../state/types";
import LinearGradient from "../../../../../components/LinearGradient/LinearGradient";
import { MdOutlineFileUpload } from "react-icons/md";
import { toast } from "react-toastify";
import { employeeListInState } from "../../../../employee/employeeSlice";
import { useLocation } from "react-router";

interface Props {
  open: boolean;
  onClose: () => void;
}

const UploadDialog = ({ open, onClose }: Props) => {
  const user = useSelector(userInState);
  const { displaySnackbar } = useSnackBarContext();
  const employeeList = useSelector(employeeListInState);
  const [documentName, setDocumentName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");

  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [addDocument, { isLoading: isAdding }] = useAddNewDocumentMutation();

  const route = useLocation();

const isHrAllEmployeePage =
  route.pathname === "/all-employee-docs";

  if (!open) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const filteredEmployeeList = employeeList.filter(
    (employee) => employee.id !== user?.id && employee.role !== "Management",
  );

  const handleUpload = async () => {
    if (!documentName.trim() || !selectedFile) {
      toast.error("Please enter name & select file");
      return;
    }

    if (!user?.id) {
      toast.error("User information not available");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("files", selectedFile);

      const uploadRes = await uploadFile(formData).unwrap();

      await addDocument({
        data: {
          documentName: documentName.trim(),
          document: uploadRes[0].id.toString(),
          user: selectedEmployeeId ? selectedEmployeeId : user.id,
        },
      }).unwrap();

      toast.success("Document uploaded successfully");
      handleClose();
    } catch (err) {
      const error = err as ICustomErrorResponse;
      displaySnackbar("error", error.message || "Upload failed");
    }
  };

  const handleClose = () => {
    setDocumentName("");
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <div className="fixed  inset-0 z-999 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl p-4 flex flex-col gap-y-3">
        <h2 className="text-lg font-semibold">Upload New Document</h2>
        <LinearGradient customClasses="" />
      {isHrAllEmployeePage &&  <div>
          <label className="text-black-50 text-base font-normal">
            Select Employee
          </label>
          <select
            onChange={(e) => {
              const value = Number(e.target.value);
              setSelectedEmployeeId(value);
            }}
            value={selectedEmployeeId}
            className="w-full mt-1 p-4 border border-black-20 rounded-2xl text-sm outline-none transition-all"
          >
            <option className="text-black-20" value="" disabled>
              Select Employee
            </option>
            {filteredEmployeeList?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>}
        <div>
          <label className="text-black-50 text-base font-normal">
            Documents Name
          </label>
          <input
            type="text"
            placeholder="Enter document name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="w-full border border-black-20 rounded-lg px-3 py-2 text-black-50 outline-0"
          />
        </div>
        <div>
          <label className="text-black-50 text-base">Upload File</label>
          <label className="justify-between border-2 border-dashed border-black-20 rounded-lg p-1 flex flex-col mt-0.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MdOutlineFileUpload />
                <span className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : "upload document"}
                </span>
              </div>

              {/* hidden input */}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFileSelect}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-base   p-2 rounded-md bg-[#F7F7F7] text-[#797571] font-bold"
              >
                Select File
              </button>
            </div>
          </label>
        </div>

        {previewUrl && selectedFile?.type.startsWith("image/") && (
          <img
            src={previewUrl}
            alt="preview"
            className="mt-4 max-h-40 mx-auto rounded"
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={isUploading || isAdding}
            className="px-4 py-2  bg-primary rounded-lg text-white w-37.5"
          >
            {isUploading || isAdding ? (
              // <ActivityIndicator   size={18} />
              <p className="text-white">Loading.....</p>
            ) : (
              "Upload"
            )}
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2  bg-[#F7F7F7] rounded-lg text-[#797571] w-37.5 font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDialog;

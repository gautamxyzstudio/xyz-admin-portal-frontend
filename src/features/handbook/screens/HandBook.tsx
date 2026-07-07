import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FaFilePdf, FaFileWord } from "react-icons/fa";

import CustomBox from "../../../components/CustomBox/CustomBox";
import CustomButton from "../../../components/CustomButton/CustomButton";
import { userInState } from "../../auth/authSlice";
import {
  useAddHandbookMutation,
  useGetHandbookListQuery,
  useUpdateHandbookMutation,
} from "../handbookApis";

const HandBook = () => {
  const user = useSelector(userInState);

  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: handbook, isLoading } = useGetHandbookListQuery();

  const [addHandbook, { isLoading: adding }] = useAddHandbookMutation();

  const [updateHandbook, { isLoading: updating }] = useUpdateHandbookMutation();

  if (!user) return null;

  const canUpload =
    user.user_type === "Admin" ||
    user.user_type === "Hr" ||
    user.user_type === "Management";

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(file.type)) {
      alert("Only PDF, DOC and DOCX files allowed");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      if (handbook?.id) {
        await updateHandbook({
          id: String(handbook.id),
          file: selectedFile,
        }).unwrap();
      } else {
        await addHandbook(selectedFile).unwrap();
      }

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getIcon = (mime?: string) => {
    if (mime === "application/pdf") {
      return <FaFilePdf className="text-red-500 text-5xl" />;
    }

    return <FaFileWord className="text-blue-500 text-5xl" />;
  };

  return (
    <CustomBox customClasses="p-6 w-full h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-black text-2xl font-semibold">
          Employee Hand Book
        </h2>

        {canUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx"
              onChange={handleSelectFile}
            />

            <CustomButton
              buttonStyle="primary"
              label="Upload File"
              onClick={() => inputRef.current?.click()}
            />
          </>
        )}
      </div>

      <div className="mt-8">
        {selectedFile && (
          <div
            className="
            border rounded-xl p-5
            flex items-center justify-between
            bg-gray-50
          "
          >
            <div className="flex items-center gap-4">
              {getIcon(selectedFile.type)}

              <div>
                <p className="font-semibold">{selectedFile.name}</p>

                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <CustomButton
              buttonStyle="primary"
              label={adding || updating ? "Uploading..." : "Save"}
              disabled={adding || updating}
              onClick={handleUpload}
            />
          </div>
        )}

        {!selectedFile && handbook?.hand_book_file && (
          <div
            className="
            border rounded-xl p-6
            flex items-center justify-between
            shadow-sm
            "
          >
            <div className="flex gap-5 items-center">
              {getIcon(handbook.hand_book_file.mime)}

              <div>
                <h3 className="font-semibold text-lg">
                  {handbook.hand_book_file.name}
                </h3>

                <p className="text-gray-500">
                  {handbook.hand_book_file.size.toFixed(2)} KB
                </p>
              </div>
            </div>

            <a href={handbook.hand_book_file.url} target="_blank">
              <CustomButton buttonStyle="primary" label="Preview" />
            </a>
          </div>
        )}

        {!selectedFile && !handbook?.hand_book_file && !isLoading && (
          <div
            className="
              text-center
              text-gray-400
              mt-20
            "
          >
            No handbook uploaded yet
          </div>
        )}
      </div>
    </CustomBox>
  );
};

export default HandBook;

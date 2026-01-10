/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";
import type { IPhotoUploadProps } from "./PhotoUpload.types";
import ActivityIndicator from "../activityIndicator/ActivityIndicator";
import type { ICustomErrorResponse } from "../../../state/types";
import { Icons } from "../../../assets/myAssets/exporter";
import { useUploadFileMutation } from "../../api/sharedApi";
import { useSnackBarContext } from "../../../wrappers/snackbarContext/useSnackBarContext";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const PhotoUpload: React.FC<IPhotoUploadProps> = ({
  getUploadedImageId,
  initialValue,
  disabled = false,
}) => {
  const { displaySnackbar } = useSnackBarContext();
  const [upload, { isLoading, error }] = useUploadFileMutation();

  const [displayImage, setDisplayImage] = useState<string | null>(
    initialValue ?? null
  );

  const previewUrlRef = useRef<string | null>(null);

  // 🔹 Sync when initialValue changes (important for profile update)
  useEffect(() => {
    setDisplayImage(initialValue ?? null);
  }, [initialValue]);

  // 🔹 Cleanup object URL
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    // Preview
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setDisplayImage(previewUrl);

    const form = new FormData();
    form.append("files", file);

    try {
      const uploadedImage = await upload(form).unwrap();
      getUploadedImageId(uploadedImage[0].id);
    } catch (err) {
      const error = err as ICustomErrorResponse;
      displaySnackbar("error", error?.message || "Upload failed");

      // rollback preview
      setDisplayImage(initialValue ?? null);
    }
  };

  return (
    <Button
      component="label"
      disabled={disabled || isLoading}
      sx={{
        background: "transparent",
        boxShadow: "none",
        "&:hover": { background: "transparent" },
        position: "relative",
      }}
    >
      {/* Default avatar */}
      {!displayImage && !error && (
        <img
          className="w-40 h-40 border-2 object-contain border-disable rounded-full"
          src={Icons.PROFILE_PICTURE}
          alt="profile"
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="w-40 h-40 absolute flex justify-center items-center border-2 rounded-full">
          <ActivityIndicator size={80} />
        </div>
      )}

      {/* Image */}
      {displayImage && (
        <img
          className="w-40 h-40 border-2 object-cover border-disable rounded-full"
          src={displayImage}
          alt="profile"
        />
      )}

      {/* Error */}
      {error && (
        <p className="absolute text-xs text-red text-center -bottom-5">
          Image upload failed
        </p>
      )}

      <VisuallyHiddenInput
        type="file"
        accept="image/*"
        onChange={onSelectFile}
      />
    </Button>
  );
};

export default PhotoUpload;

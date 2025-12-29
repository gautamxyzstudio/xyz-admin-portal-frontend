import { useState } from "react";
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
  background: "red",
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
}) => {
  const [displayImage, setDisplayImage] = useState<string | null>(
    initialValue ?? null
  );
  const { displaySnackbar } = useSnackBarContext();
  const [upload, { isLoading, error }] = useUploadFileMutation();
  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const dImage = URL.createObjectURL(e.target.files[0]);
      setDisplayImage(dImage);
      const form = new FormData();
      form.append("files", e.target.files[0]);
      try {
        const uploadedImage = await upload(form).unwrap();
        getUploadedImageId(uploadedImage[0].id);
      } catch (e) {
        console.log(e, "ERROR");
        const error = e as ICustomErrorResponse;
        displaySnackbar("error", error.message);
      }
    }
  };

  return (
    <>
      <Button
        role={undefined}
        variant="contained"
        component="label"
        sx={{
          background: "transparent",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
            backgroundColor: "transparent",
          },
          position: "relative",
        }}
        tabIndex={-1}
      >
        {!displayImage && !error && (
          <img
            className=" w-40 h-40  flex justify-center items-center border-2 object-contain border-disable rounded-full"
            src={Icons.PROFILE_PICTURE}
            alt="profile"
          />
        )}
        {isLoading && (
          <div className="w-40 h-40 absolute flex justify-center items-center border-2 object-contain border-disable rounded-full">
            <ActivityIndicator size={80} />
          </div>
        )}
        {displayImage && (
          <img
            className="w-40 h-40  border-2 object-cover border-disable rounded-full"
            height={160}
            width={160}
            src={displayImage}
            alt="logo"
          />
        )}
        {error && (
          <div className="w-14 h-14 absolute bg-modal flex justify-center items-center border-2 object-contain border-red rounded-full">
            <h1 className="text-Red font-bold text-[10px] ">error</h1>
          </div>
        )}
        {error && (
          <h1 className="absolute text-[10px] capitalize text-red w-125 text-center -bottom-4">
            Image upload Failed. please try again
          </h1>
        )}

        <VisuallyHiddenInput
          type="file"
          onChange={onSelectFile}
          accept="image/*"
        />
      </Button>
    </>
  );
};

export default PhotoUpload;

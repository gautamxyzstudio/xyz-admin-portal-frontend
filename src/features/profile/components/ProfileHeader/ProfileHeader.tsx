/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaCamera } from "react-icons/fa";
import Cropper from "react-easy-crop";
import { Icons, Images } from "../../../../assets/myAssets/exporter";
import { userDetailsInState, userInState } from "../../../auth/authSlice";
import {
  useUpdateEmployeeDetailsMutation,
  useUpdateUserMutation,
} from "../../../employee/employeeApis";
import { useUploadFileMutation } from "../../../../shared/api/sharedApi";
import ActivityIndicator from "../../../../shared/components/activityIndicator/ActivityIndicator";
import { useLazyUserDetailsQuery } from "../../../auth/authApi";
import { toast } from "react-toastify";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { IoClose } from "react-icons/io5";
import { Controller, useForm } from "react-hook-form";
import { Switch } from "@mui/material";

// Image quality fix logic
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: any,
): Promise<Blob> => {
  const image = new Image();
  image.src = imageSrc;
  image.setAttribute("crossOrigin", "anonymous");
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.95,
    );
  });
};

const ProfileHeader: React.FC = () => {
  const userDetails = useSelector(userDetailsInState);
  const user = useSelector(userInState);

  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateEmployeeDetailsMutation();
  const [updateUser] = useUpdateUserMutation();
  const [refetchProfile] = useLazyUserDetailsQuery();

  const [coverPreview, setCoverPreview] = useState<string | null>(
    userDetails?.coverImage ?? null,
  );
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"profile" | "cover">("cover");
  const [showCropModal, setShowCropModal] = useState(false);

  // Cropper States
  const [crop, setCrop] = useState({ x: 5, y: 3 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  if (!userDetails || !user) return null;

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover",
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCropType(type);
      setZoom(1); // Reset zoom for new image
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setShowCropModal(true);
      };
    }
  };

  const { control } = useForm({
    defaultValues: {
      emailSubscription: userDetails?.emailSubscription,
    },
  });

  console.log(userDetails);
  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const file = new File([croppedBlob], `cropped-${cropType}.jpg`, {
        type: "image/jpeg",
      });

      const form = new FormData();
      form.append("files", file);

      const uploaded = await uploadFile(form).unwrap();
      const imageId = uploaded[0].id;

      const updateData =
        cropType === "cover"
          ? { coverImage: imageId.toString() }
          : { Photo: [imageId.toString()] };

      await updateProfile({
        id: userDetails.details_id.toString(),
        data: updateData,
      }).unwrap();

      await refetchProfile({ id: user.id }).unwrap();

      if (cropType === "cover")
        setCoverPreview(URL.createObjectURL(croppedBlob));

      setShowCropModal(false);
      toast.success(
        `${cropType === "cover" ? "Cover" : "Profile"} updated successfully`,
      );
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    }
  };

  const avatarSrc = userDetails?.photo
    ? userDetails.photo.startsWith("http")
      ? userDetails.photo
      : `${import.meta.env.VITE_API_BASE_URL}${userDetails.photo}`
    : "/static/images/avatar/default.jpg";

  /* ---------------- STATUS UPDATE ---------------- */
const updateStatus = async (value: boolean) => {
  try {
    await updateUser({
      id: user.id.toString(),
      status: value,
    }).unwrap();

    await refetchProfile({ id: user.id }).unwrap();

    if (value) {
      toast.success("Email subscription turned ON");
    } else {
      toast.info("Email subscription turned OFF");
  
    }
  } catch (err: any) {
    toast.error(err?.message || "Failed to update status");
  }
};



  return (
    <div className="w-full rounded-xl overflow-hidden">
      {/* Banner Section */}
      <div className="relative w-full max-h-50  min-h-50">
        <img
          src={coverPreview ? coverPreview : Images.BANNER}
          className="w-full max-h-50  min-h-50 object-cover rounded-2xl"
          alt="Banner"
        />
        <label className="absolute right-4 bottom-2 bg-white p-2 rounded-lg cursor-pointer shadow-md">
          <img src={Icons.UPDATE_IMG} alt="edit" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "cover")}
          />
        </label>
        {isUploading && cropType === "cover" && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl">
            <ActivityIndicator size={40} />
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="flex justify-between ">
        <div className="flex flex-row gap-x-5  justify-between pl-8 pb-8 -mt-16">
          <div className="relative">
            <div className="w-38 h-38 rounded-full border-4 border-primary overflow-hidden bg-gray-100 shadow-lg relative">
              <img
                src={avatarSrc}
                className="w-full h-full object-contain"
                alt="Profile"
              />
              {isUploading && cropType === "profile" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <ActivityIndicator size={30} />
                </div>
              )}
            </div>
            <label className="absolute bottom-2 right-2 bg-primary p-2 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform">
              <FaCamera size={18} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "profile")}
              />
            </label>
          </div>

          <div className="flex flex-row items-center gap-x-4 h-full mt-10">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-black leading-8">
                {userDetails?.name}
              </h2>
              <p className="text-black-80 font-normal text-base">
                {userDetails?.designation}
              </p>
            </div>
            <span
              className={`flex px-6.5 py-2 text-base rounded-full ${userDetails?.status ? "bg-lightGreen text-green" : "bg-lightRed text-red"}`}
            >
              {userDetails?.status ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex justify-end ">
          <div className="flex flex-row items-center gap-2">
            <p className="text-base font-semibold">Email Subscription</p>

            <Controller
              control={control}
              name="emailSubscription"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={(e) => {
                    const value = e.target.checked;
                    field.onChange(value);
                    updateStatus(value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      {/* --- CROP MODAL (Clean Version) --- */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-1000 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">
                Adjust{" "}
                {cropType === "profile" ? "Profile Photo" : "Cover Image"}
              </h3>
              <button
                onClick={() => setShowCropModal(false)}
                className="text-black-50 text-2xl"
              >
                <IoClose />
              </button>
            </div>

            <div className="relative w-full h-100 bg-gray-200">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={cropType === "profile" ? 1 : 16 / 4}
                cropShape={cropType === "profile" ? "round" : "rect"}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}  
                zoomWithScroll={true}
                maxZoom={10}
              />
            </div>

            <div className="p-4 flex flex-col items-center">
              <div className="flex justify-end gap-3 w-full">
                <CustomButton
                  label="Cancel"
                  buttonStyle="secondary"
                  onClick={() => setShowCropModal(false)}
                  customStyles="px-8"
                />
                <CustomButton
                  label={
                    isUploading || isUpdating ? "Uploading..." : "Save Changes"
                  }
                  buttonStyle={
                    isUploading || isUpdating ? "disabled" : "primary"
                  }
                  disabled={isUploading || isUpdating}
                  onClick={handleCropSave}
                  customStyles="px-8 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;

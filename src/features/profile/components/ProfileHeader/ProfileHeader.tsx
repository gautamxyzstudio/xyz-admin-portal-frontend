/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import { FaCamera } from "react-icons/fa";
import { Icons, Images } from "../../../../assets/myAssets/exporter";
import { userDetailsInState, userInState } from "../../../auth/authSlice";
import { useSnackBarContext } from "../../../../wrappers/snackbarContext/useSnackBarContext";
import PhotoUpload from "../../../../shared/components/photoUpload/PhotoUpload";
import { useUpdateEmployeeDetailsMutation } from "../../../employee/employeeApis";
import { useState } from "react";
import { useUploadFileMutation } from "../../../../shared/api/sharedApi";
import ActivityIndicator from "../../../../shared/components/activityIndicator/ActivityIndicator";
import { useLazyUserDetailsQuery } from "../../../auth/authApi";

const getStatusText = (status: boolean) => (status ? "Active" : "Inactive");

const getStatusClasses = (status: boolean) =>
  status ? "bg-lightGreen text-green" : "bg-lightRed text-red";

const ProfileHeader: React.FC = () => {
  const userDetails = useSelector(userDetailsInState);
  const user = useSelector(userInState);
  const [coverPreview, setCoverPreview] = useState<string>(
    userDetails?.coverImage ?? Images.BANNER
  );

  const { displaySnackbar } = useSnackBarContext();
  const [uploadCover, { isLoading: coverUploading }] = useUploadFileMutation();
  const [updateProfile, { isLoading }] = useUpdateEmployeeDetailsMutation();
  const [refetchProfile] = useLazyUserDetailsQuery();

  if (!userDetails) return null;
  if (!user) return null;
  // Cover Image change
  const onCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);

    const form = new FormData();
    form.append("files", file);

    try {
      const uploaded = await uploadCover(form).unwrap();
      const imageId = uploaded[0].id;

      await updateProfile({
        id: userDetails.details_id.toString(),
        data: {
          coverImage: imageId.toString(),
        },
      }).unwrap();
      // 🔥 refetch user data
      await refetchProfile({ id: user.id }).unwrap();
      displaySnackbar("success", "Cover image updated");
    } catch (err: any) {
      displaySnackbar("error", err?.message || "Upload failed");
      setCoverPreview(userDetails?.coverImage ?? Images.BANNER);
    }
  };

  // Profile Change
  const handlePhotoUpdate = async (photoId: number) => {
    try {
      await updateProfile({
        id: userDetails.details_id.toString(),
        data: {
          Photo: [photoId.toString()],
        },
      }).unwrap();
      // 🔥 refetch user data
      await refetchProfile({ id: user.id }).unwrap();
      displaySnackbar("success", "Profile photo updated successfully");
    } catch (error: any) {
      displaySnackbar("error", error?.message || "Failed to update photo");
    }
  };

  const avatarSrc = userDetails?.photo
    ? userDetails.photo.startsWith("http")
      ? userDetails.photo
      : `${import.meta.env.VITE_API_BASE_URL}${userDetails.photo}`
    : "/static/images/avatar/default.jpg";

  return (
    <div className="w-full rounded-xl overflow-hidden">
      {/* Banner Image */}
      <div className="relative w-full h-40">
        <img
          src={
            coverPreview
              ? coverPreview.startsWith("http")
                ? coverPreview
                : `${import.meta.env.VITE_API_BASE_URL}${coverPreview}`
              : Images.BANNER
          }
          alt="Banner"
          className="w-full h-41.75 object-cover rounded-2xl"
        />

        {/* Edit icon */}
        <div className="absolute right-4 bottom-2 bg-white p-2 rounded-lg cursor-pointer">
          <label htmlFor="coverImg-upload" className="cursor-pointer">
            <img src={Icons.UPDATE_IMG} alt="edit" />
          </label>

          <input
            id="coverImg-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onCoverSelect}
            disabled={coverUploading}
          />
        </div>

        {/* Loader */}
        {coverUploading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl">
            <ActivityIndicator size={50} />
          </div>
        )}
      </div>

      {/* Avatar and Info */}
      <div className="flex flex-row gap-x-5 items-end-safe pl-8 pb-8 -mt-17">
        <div className="relative h-38">
          <PhotoUpload
            initialValue={avatarSrc}
            disabled={isLoading}
            getUploadedImageId={handlePhotoUpdate}
          />
          <div className="absolute bottom-2 right-2 bg-primary p-2 rounded-full cursor-pointer">
            <FaCamera size={20} className="text-white" />
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-row items-center gap-x-4 h-full ">
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-black leading-8">
              {userDetails?.name || "User Name"}
            </h2>
            <p className="text-black-80 font-normal text-base">
              {userDetails?.designation || "Designation"}
            </p>
          </div>
          <span
            className={`flex px-6.5 py-2 text-base items-center justify-center rounded-full  ${getStatusClasses(
              userDetails?.status ?? false
            )}`}
          >
            {getStatusText(userDetails?.status ?? false)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

/* eslint-disable react-hooks/exhaustive-deps */
import { Close } from "@mui/icons-material";
import { Dialog, Skeleton, TextField } from "@mui/material";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import { Controller, useForm } from "react-hook-form";
import PickerInput from "../../../../shared/components/pickerInput/PickerInput";
import dayjs from "dayjs";
import CustomButton from "../../../../components/CustomButton/CustomButton";

import {
  useCreateAnnouncementMutation,
  useLazyGetAnnouncementByIdQuery,
  useUpdateAnnouncementMutation,
} from "../../announcementsApi";
import { useEffect } from "react";
import type { AnnouncementPayload } from "../../types";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import { toast } from "react-toastify";

const AnnouncementDialog = ({
  onClose,
  open,
  announcementId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  announcementId?: number | null;
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementPayload>({
    defaultValues: { title: "", description: "", date: "" },
  });

  const [getAnnouncementDetail, { isFetching }] =
    useLazyGetAnnouncementByIdQuery();
  const { setIsLoading } = useLoadingWrapper();
  const [createAnnouncement] = useCreateAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();

  const fetchAnnouncement = async (id: number) => {
    const res = await getAnnouncementDetail(id).unwrap();
    reset({
      title: res.title,
      description: res.description,
      date: res.date,
    });
  };

  useEffect(() => {
    if (!open) {
      reset(); // ✅ clear form when dialog closes
    }
  }, [open, reset]);

  useEffect(() => {
    if (announcementId) {
      fetchAnnouncement(announcementId);
    } else {
      reset({
        title: "",
        description: "",
        date: "",
      });
    }
  }, [announcementId]);

  // Handle announcement creation
  const handleCreateAnnouncement = async (data: AnnouncementPayload) => {
    try {
      setIsLoading(true);

      await createAnnouncement({
        data: {
          Title: data.title,
          Description: data.description,
          Date: dayjs(data.date).format("YYYY-MM-DD"),
        },
      }).unwrap();
      toast.success("Announcement posted successfully");
      onSuccess?.();
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Announcement POST error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnnouncementHandler = async (data: AnnouncementPayload) => {
    try {
      setIsLoading(true);
      const response = await updateAnnouncement({
        id: Number(announcementId),
        data: {
          data: {
            Title: data.title,
            Date: dayjs(data.date).format("YYYY-MM-DD"),
            Description: data.description,
          },
        },
      }).unwrap();

      if (response) {
        toast.success("Announcement updated successfully");
        onSuccess?.();
        reset();
        onClose();
      }
    } catch (error) {
      toast.error("Announcement updated error, something went wrong");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
      }}
      maxWidth="xs"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          padding: "20px",
          display: "flex",
          borderRadius: "16px",
          gap: "10px",
        },
      }}
    >
      <div className="flex justify-between mb-1">
        <h3 className="text-xl font-semibold leading-7">Add Announcements</h3>
        <Close
          className="cursor-pointer"
          onClick={() => {
            onClose();
          }}
        />
      </div>

      <LinearGradient />

      <form
        onSubmit={
          announcementId
            ? handleSubmit(updateAnnouncementHandler)
            : handleSubmit(handleCreateAnnouncement)
        }
        className="flex flex-col gap-5"
      >
        {isFetching ? (
          <Skeleton height={60} />
        ) : (
          <Controller
            name="title"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
              />
            )}
          />
        )}

        {isFetching ? (
          <Skeleton height={60} />
        ) : (
          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
              />
            )}
          />
        )}

        {isFetching ? (
          <Skeleton height={60} />
        ) : (
          <Controller
            name="date"
            control={control}
            rules={{ required: "Date is required" }}
            render={({ field }) => (
              <PickerInput
                label="Date"
                value={field.value ? dayjs(field.value) : null}
                setValue={field.onChange}
                disablePast
                popperPlacement="top-end"
                errorMessage={errors.date?.message ?? ""}
              />
            )}
          />
        )}
        <LinearGradient />

        <div className="flex gap-3">
          <CustomButton
            customStyles=""
            label={
              announcementId
                ? "Update Holiday"
                : isSubmitting
                ? "Posting..."
                : "Post Announcement"
            }
            type="submit"
            disabled={isSubmitting}
          />

          <CustomButton
            label="Cancel"
            customStyles=""
            type="reset"
            buttonStyle="secondary"
            onClick={() => {
              onClose();
            }}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AnnouncementDialog;

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import {
  useLazyGetHolidayByIdQuery,
  usePatchHolidayMutation,
  usePostHolidayMutation,
} from "../../holydayListApi";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { GridCloseIcon } from "@mui/x-data-grid";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import PickerInput from "../../../../shared/components/pickerInput/PickerInput";
import FormTextInput from "../../../../shared/components/formInput/FormInput";
import { getError } from "../../../../utils/utils";
import { useEffect } from "react";
import { Dialog, Skeleton } from "@mui/material";
import type { IAddHolidayFormData } from "../../holydayList.types";

const HolidayForm = ({
  onClose,
  open,
  holidayId,
}: {
  open: boolean;
  onClose: () => void;
  holidayId?: number | null;
}) => {
  const { setIsLoading } = useLoadingWrapper();
  const [postHoliday] = usePostHolidayMutation();
  const [patchHoliday] = usePatchHolidayMutation();
  const [getHolidayDetail, { isFetching }] = useLazyGetHolidayByIdQuery();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IAddHolidayFormData>({
    defaultValues: {
      name: "",
      date: "",
    },
  });

  const fetchHoliday = async (id: number) => {
    const res = await getHolidayDetail(id).unwrap();
    reset({
      name: res.name,
      date: res.date,
    });
  };

  useEffect(() => {
    if (!open) {
      reset(); // ✅ clear form when dialog closes
    }
  }, [open, reset]);

  useEffect(() => {
    if (holidayId) {
      fetchHoliday(holidayId);
    } else {
      reset({
        name: "",
        date: "",
      });
    }
  }, [holidayId]);

  const onSubmit = async (data: IAddHolidayFormData) => {
    try {
      setIsLoading(true);

      await postHoliday({
        data: {
          Name: data.name,
          date: dayjs(data.date).format("YYYY-MM-DD"),
        },
      }).unwrap();

      toast.success("Holiday created successfully");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const updateHolidayHandler = async (data: IAddHolidayFormData) => {
    try {
      setIsLoading(true);
      const response = await patchHoliday({
        id: Number(holidayId),
        data: {
          data: {
            Name: data.name,
            date: dayjs(data.date).format("YYYY-MM-DD"),
          },
        },
      }).unwrap();

      if (response) {
        toast.success("Holiday updated successfully");
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Something went wrong");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          padding: 0,
        },
      }}
      fullWidth
      open={open}
      onClose={onClose}
    >
      <form
        onSubmit={
          holidayId
            ? handleSubmit(updateHolidayHandler)
            : handleSubmit(onSubmit)
        }
        className="p-5 w-full flex flex-col"
      >
        {/* Name */}

        <div className="flex justify-between">
          <h3 className="text-xl font-semibold ">Holiday Name</h3>
          <button type="button" onClick={onClose} className="">
            <GridCloseIcon className="cursor-pointer" />
          </button>
        </div>
        <LinearGradient customClasses="my-4" />

        {isFetching ? (
          <Skeleton height={60} />
        ) : (
          <Controller
            name="name"
            control={control}
            rules={{ required: "Holiday name is required" }}
            render={({ field }) => (
              <FormTextInput
                errorMessage={getError(errors.name)}
                label={"Holiday Name"}
                value={field.value}
                placeholder="Enter holiday name"
                onChange={field.onChange}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "16px",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "16px",
                  },
                }}
              />
            )}
          />
        )}
        <div className="mt-4" />
        {isFetching ? (
          <Skeleton height={60} />
        ) : (
          <Controller
            control={control}
            name="date"
            rules={{ required: "Date is required" }}
            render={({ field }) => (
              <PickerInput
                label="Holiday Date"
                value={field.value ? dayjs(field.value) : null}
                setValue={field.onChange}
                errorMessage={getError(errors.date)}
                slotProps={{
                  textField: {
                    sx: {
                      "& .MuiInputBase-input": {
                        fontSize: "16px",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "16px",
                      },
                    },
                  },
                }}
              />
            )}
          />
        )}

        <LinearGradient customClasses="my-4" />
        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <CustomButton
            type="reset"
            label="Cancel"
            onClick={onClose}
            buttonStyle="secondary"
          />

          <CustomButton
            type="submit"
            label={
              holidayId
                ? "Update Holiday"
                : isSubmitting
                ? "Creating..."
                : "Create Holiday"
            }
            disabled={isSubmitting}
            buttonStyle="primary"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default HolidayForm;

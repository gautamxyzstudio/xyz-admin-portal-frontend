 /* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import { usePostHolidayMutation } from "../../holydayListApi";
import type { IAddHolidayFormData } from "../../holydayList.types";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { GridCloseIcon } from "@mui/x-data-grid";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import PickerInput from "../../../../shared/components/pickerInput/PickerInput";

const AddHolidayForm = ({ onClose }: { onClose: () => void }) => {
  const { setIsLoading } = useLoadingWrapper();
  const [postHoliday] = usePostHolidayMutation();

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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
        {/* Name */}
        <div className="">
           <div className="flex justify-between mb-3">
                  <h3 className="text-xl font-semibold ">Holiday Name</h3>
                  <button type="button" onClick={onClose} className="ml-auto">
                    <GridCloseIcon className="cursor-pointer" />
                  </button>
                </div>
                <LinearGradient />
          <Controller
            name="name"
            control={control}
            rules={{ required: "Holiday name is required" }}
            render={({ field }) => (
              <input
                {...field}
                className="border border-gray-300 rounded px-3 py-3 w-full outline-none mt-3  "
                placeholder="Enter holiday name"
              />
            )}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Date */}
        {/* <div>
          <label className="text-sm font-medium">Holiday Date</label>
          <Controller
            name="date"
            control={control}
            rules={{ required: "Date is required" }}
            render={({ field }) => (
              <input
                type="date"
                {...field}
                className="border border-gray-300 rounded px-3 py-2 w-full outline-none  "
              />
            )}
          />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div> */}
          <div className="flex flex-col mt-1  w-full">
            <Controller
              control={control}
              name="date"
              rules={{ required: "Date is required" }}
              render={({ field }) => (
                <PickerInput
                  label="Holiday Date"
                  value={field.value ? dayjs(field.value) : null}
                  setValue={field.onChange}
                  errorMessage={errors.date?.message}
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
          </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <CustomButton
            label={"Cancel"}
            onClick={onClose}
            buttonStyle="secondary"
          />

          <CustomButton
            type="submit"
            label={isSubmitting ? "Creating..." : "Create Holiday"}
            disabled={isSubmitting}
            buttonStyle="primary"
          />
        </div>
      </form>
    </>
  );
};

export default AddHolidayForm;

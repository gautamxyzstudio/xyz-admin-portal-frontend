/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, useForm } from "react-hook-form";
import FormTextInput from "../../../../shared/components/formInput/FormInput";
import type { IAddHolidayFormData, IHoliday } from "../../holydayList.types";
import dayjs from "dayjs";
import PickerInput from "../../../../shared/components/pickerInput/PickerInput";
import { useEffect } from "react";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import { GridCloseIcon } from "@mui/x-data-grid";

interface EditHolidayFormProps {
  onPressSubmit: (data: IAddHolidayFormData) => void;
  holiday: IHoliday;
  onClose: () => void;
}

const EditHolidayForm = ({
  onPressSubmit,
  holiday,
  onClose,
}: EditHolidayFormProps) => {
  const defaultValues: IAddHolidayFormData = {
    name: "",
    date: "",
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  useEffect(() => {
    if (holiday) {
      setValue("name", holiday.attributes?.Name || holiday.Name || "");
      setValue("date", holiday.attributes?.date || holiday.date || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holiday]);

  const onSubmit = (data: IAddHolidayFormData) => {
    onPressSubmit(data);
  };

  return (
    <div className="flex flex-col w-full p-3">
      <div className="flex justify-between mb-2">
        <h3 className="text-xl font-semibold "> Edit Holiday</h3>
        <button type="button" onClick={onClose} className="ml-auto">
          <GridCloseIcon className="cursor-pointer" />
        </button>
      </div>
      <LinearGradient />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col w-full ">
          <div className="flex flex-col mt-4 gap-6 w-full">
            <Controller
              control={control}
              name="name"
              rules={{ required: "Holiday name is required" }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={(errors as any).name?.message}
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
          </div>
          <div className="flex flex-col mt-10 gap-6 w-full">
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
        </div>
        <div className="flex flex-row mt-12 w-full justify-end items-center">
          <CustomButton
            label={"Update Holiday"}
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </form>
    </div>
  );
};

export default EditHolidayForm;

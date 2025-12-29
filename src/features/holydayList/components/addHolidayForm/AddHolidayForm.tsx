import { Controller, useForm } from 'react-hook-form';
import FormTextInput from '../../../../shared/components/formInput/FormInput';
import MDButton from '../../../../components/MDButton/MDButton';
import type { IAddHolidayFormData } from '../../holydayList.types';
import dayjs from 'dayjs';
import PickerInput from '../../../../shared/components/pickerInput/PickerInput';

const AddHolidayForm = ({
  onPressSubmit,
}: {
  onPressSubmit: (data: IAddHolidayFormData) => void;
}) => {
  const defaultValues: IAddHolidayFormData = {
    name: '',
    date: '',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const onSubmit = (data: IAddHolidayFormData) => {
    onPressSubmit(data);
  };

  return (
    <div className="flex flex-col w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row w-full justify-around items-start">
          <div className="flex flex-col mt-10 gap-6 w-[40%]">
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Holiday name is required' }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={(errors as any).name?.message}
                  label={'Holiday Name'}
                  value={field.value}
                  placeholder="Enter holiday name"
                  onChange={field.onChange}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '16px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '16px',
                    },
                  }}
                />
              )}
            />
          </div>
          <div className="flex flex-col mt-10 gap-6 w-[40%]">
            <Controller
              control={control}
              name="date"
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <PickerInput
                  label="Holiday Date"
                  value={field.value ? dayjs(field.value) : null}
                  setValue={field.onChange}
                  errorMessage={errors.date?.message}
                  slotProps={{
                    textField: {
                      sx: {
                        '& .MuiInputBase-input': {
                          fontSize: '16px',
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '16px',
                        },
                      },
                    },
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className="flex flex-row mt-12 w-full justify-center items-center">
          <MDButton
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            size="medium"
            color="orange"
          >
            Create Holiday
          </MDButton>
        </div>
      </form>
    </div>
  );
};

export default AddHolidayForm;

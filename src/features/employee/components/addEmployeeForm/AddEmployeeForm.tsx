/* eslint-disable @typescript-eslint/no-explicit-any */
import { Autocomplete, Switch, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import FormTextInput from '../../../../shared/components/formInput/FormInput';
import PhotoUpload from '../../../../shared/components/photoUpload/PhotoUpload';
import PasswordInput from '../../../../shared/components/PasswordInput/PasswordInput';
import MDButton from '../../../../components/MDButton/MDButton';
import { useEffect, useState } from 'react';
import type{ AddEmployeeFormData } from './AddEmployeeForm.types';
import { EmployeeRole } from '../../../../shared/enums';
import dayjs from 'dayjs';
import PickerInput from '../../../../shared/components/pickerInput/PickerInput';
import { toast } from 'react-toastify';

const AddEmployeeForm = ({
  onPressSubmit,
}: {
  onPressSubmit: (data: AddEmployeeFormData) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const defaultValues: AddEmployeeFormData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    joiningDate: '',
    avatar: '',
    status: 'active',
    leaveBalance: '',
    designation: '',
    employeeCode: '',
    role: '',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const onSubmit = (data: AddEmployeeFormData) => {
    onPressSubmit(data);
  };

  console.log(errors);

  useEffect(() => {
    if (errors.avatar) {
      toast.error(errors.avatar.message);
    }
  }, [errors.avatar]);

  return (
    <div className="flex flex-col w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row w-full justify-center items-center">
          <Controller
            control={control}
            name="avatar"
            rules={{ required: 'Avatar is required' }}
            render={({ field }) => (
              <PhotoUpload getUploadedImageId={(id) => field.onChange(id)} />
            )}
          />
        </div>
        <div className="flex flex-row w-full justify-around items-start">
          <div className="flex flex-col mt-10 gap-6 w-[40%]">
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={(errors as any).name?.message}
                  label={'Name'}
                  value={field.value}
                  placeholder="Name"
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              name="email"
              render={({ field }) => (
                <FormTextInput
                  errorMessage={(errors as any).email?.message}
                  label={'Email'}
                  value={field.value}
                  placeholder="Email"
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long',
                },
              }}
              render={({ field }) => (
                <PasswordInput
                  errorMessage={errors.password?.message}
                  label={'Password'}
                  value={field.value}
                  placeholder="Password"
                  onChange={field.onChange}
                  showPassword={showPassword}
                  handleClickShowPassword={() => setShowPassword(!showPassword)}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              rules={{
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Invalid phone number',
                },
              }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={(errors as any).phone?.message}
                  label={'Phone number'}
                  value={field.value}
                  maxLength={10}
                  placeholder="Phone"
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="role"
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <Autocomplete
                  disablePortal
                  options={Object.values(EmployeeRole)}
                  disableClearable
                  freeSolo={false}
                  value={field.value || ''}
                  onChange={(_, value) => field.onChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Role"
                      variant="outlined"
                      inputProps={{
                        ...params.inputProps,
                        readOnly: true,
                      }}
                    />
                  )}
                />
              )}
            />
            <div className="flex flex-row items-center gap-2">
              <p className="text-sm font-medium">Status:</p>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Switch
                    defaultChecked={field.value === 'active'}
                    color="warning"
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex flex-col mt-10 gap-6 w-[40%]">
            <Controller
              control={control}
              name="designation"
              rules={{ required: 'Designation is required' }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={(errors as any).designation?.message}
                  label={'Designation'}
                  value={field.value}
                  placeholder="Designation"
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="employeeCode"
              rules={{ required: 'Employee Code is required' }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={(errors as any).employeeCode?.message}
                  label={'Employee Code'}
                  value={field.value}
                  placeholder="Employee Code"
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="joiningDate"
              rules={{ required: 'Joining Date is required' }}
              render={({ field }) => (
                <PickerInput
                  label="Joining Date"
                  value={field.value ? dayjs(field.value) : null}
                  setValue={field.onChange}
                  errorMessage={errors.joiningDate?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="leaveBalance"
              rules={{ required: 'Leave Balance is required' }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={(errors as any).leaveBalance?.message}
                  label={'Leave Balance'}
                  value={field.value}
                  placeholder="Leave Balance"
                  onChange={field.onChange}
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
            Create
          </MDButton>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeForm;

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import DashboardLayout from '../../../../examples/LayoutContainers/DashboardLayout/index.jsx';
import DashboardNavbar from '../../../../examples/Navbars/DashboardNavbar/index.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import type { IEmployee } from '../../types';
import { Controller, useForm } from 'react-hook-form';
import PhotoUpload from '../../../../shared/components/photoUpload/PhotoUpload';
import FormTextInput from '../../../../shared/components/formInput/FormInput';
import { Autocomplete, Switch, TextField } from '@mui/material';
import { EmployeeRole } from '../../../../shared/enums';
import dayjs from 'dayjs';
import PickerInput from '../../../../shared/components/pickerInput/PickerInput';
import {
  useGetEmployeeLeaveBalanceQuery,
  useUpdateEmployeeDetailsMutation,
  useUpdateUserLeaveBalanceMutation,
} from '../../employeeApis';
import { toast } from 'react-toastify';
import { useLoadingWrapper } from '../../../../wrappers/loadingWrapper/LoadingWrapper.context.js';
import { getError, getString } from '../../../../utils/utils.js';

type EditEmployeeForm = {
  name: string;
  phone: string;
  status: boolean;
  joiningDate: string;
  avatar: string | null;
  photoId: string;
  leaveBalance: string;
  unpaidLeaveBalance: string;
  designation: string;
  employeeCode: string;
  role: string;
};


const EditEmployee = () => {
  const { employee } = useLocation()?.state as { employee: IEmployee };
  const navigate = useNavigate();
  const { setIsLoading } = useLoadingWrapper();
  const [updateEmployee, { isLoading }] = useUpdateEmployeeDetailsMutation();
  const [updateUserLeaveBalance, { isLoading: isLoadingLeaveBalance }] =
    useUpdateUserLeaveBalanceMutation();
  const { data: leaveBalance, isFetching } = useGetEmployeeLeaveBalanceQuery(
    { id: employee.id.toString() },
    { skip: !employee, refetchOnMountOrArgChange: true }
  );

  // Set up form with default values
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditEmployeeForm>({
    defaultValues: {
      name: '',
      phone: '',
      status: employee.status,
      joiningDate: '',
      avatar: null,
      photoId: employee.imageId ? employee.imageId.toString() : '',
      leaveBalance: '',
      unpaidLeaveBalance: '',
      designation: '',
      employeeCode: '',
      role: '',
    },
  });

  // Set loading state for leave balance fetch
  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching, setIsLoading]);

  // Populate leave balance fields when data is fetched
  useEffect(() => {
    if (leaveBalance) {
      setValue('leaveBalance', leaveBalance.leave_balance.toString());
      setValue('unpaidLeaveBalance', leaveBalance.unpaid_leave_balance.toString());
    }
  }, [leaveBalance, setValue]);

  // Populate form fields with employee data
  useEffect(() => {
    if (employee) {
      setValue('name', employee.name);
      setValue('phone', employee.phoneNumber);
      setValue('role', employee.role);
      setValue('designation', employee.designation);
      setValue('employeeCode', employee.empCode);
      setValue('joiningDate', employee.joiningDate);
      setValue('leaveBalance', employee.leave_balance.toString());
      setValue('unpaidLeaveBalance', employee.unpaid_leave_balance.toString());
      setValue('avatar', employee.image);
      setValue('photoId', employee.imageId ? employee.imageId.toString() : '');
      setValue('status', employee.status);
    }
  }, [employee, setValue]);

  // Handle form submission
  const onSubmit = async (data: EditEmployeeForm) => {
    const employeePayload = {
      name: data.name,
      designation: data.designation,
      empCode: data.employeeCode,
      joiningDate: data.joiningDate,
      phoneNumber: data.phone,
      Photo: [data.photoId],
      status: data.status,
    };
    const leaveBalancePayload = {
      id: employee.id.toString(),
      data: {
        leave_balance: Number(data.leaveBalance),
        unpaid_leave_balance: Number(data.unpaidLeaveBalance),
      },
    };
    try {
      await updateEmployee({
        id: employee.details_id.toString(),
        data: employeePayload,
      }).unwrap();
      await updateUserLeaveBalance(leaveBalancePayload).unwrap();
      toast.success('Employee updated successfully');
      navigate('/employees');
    } catch (error: any) {
      toast.error(error?.message ?? 'Something went wrong');
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="flex flex-col w-full justify-center items-center">
        {/* Avatar Upload */}
        <Controller
          control={control}
          name="avatar"
          rules={{ required: 'Avatar is required' }}
          render={({ field }) => (
            <PhotoUpload
              initialValue={employee.image}
              getUploadedImageId={(id) => {
                field.onChange(id);
                setValue('photoId', String(id));
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="photoId"
          render={({ field }) => <input type="hidden" {...field} />}
        />
        <div className="flex flex-row w-full justify-around items-start">
          {/* Left Column */}
          <div className="flex flex-col mt-10 gap-6 w-[40%]">
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={getError(errors.name)}
                  label="Name"
                  value={getString(field.value)}
                  placeholder="Name"
                  onChange={field.onChange}
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
                  errorMessage={getError(errors.phone)}
                  label="Phone number"
                  value={getString(field.value)}
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
                    checked={!!field.value}
                    color="warning"
                    onChange={(_, checked) => field.onChange(checked)}
                  />
                )}
              />
            </div>
          </div>
          {/* Right Column */}
          <div className="flex flex-col mt-10 gap-6 w-[40%]">
            <Controller
              control={control}
              name="designation"
              rules={{ required: 'Designation is required' }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={getError(errors.designation)}
                  label="Designation"
                  value={getString(field.value)}
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
                  errorMessage={getError(errors.employeeCode)}
                  label="Employee Code"
                  value={getString(field.value)}
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
                  value={field.value ? dayjs(field.value) : dayjs()}
                  setValue={field.onChange}
                  errorMessage={getError(errors.joiningDate)}
                />
              )}
            />
            <Controller
              control={control}
              name="leaveBalance"
              rules={{ required: 'Leave Balance is required' }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={getError(errors.leaveBalance)}
                  label="Leave Balance"
                  value={getString(field.value)}
                  placeholder="Leave Balance"
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="unpaidLeaveBalance"
              rules={{ required: 'Unpaid Leave Balance is required' }}
              render={({ field }) => (
                <FormTextInput
                  errorMessage={getError(errors.unpaidLeaveBalance)}
                  label="Unpaid Leave Balance"
                  value={getString(field.value)}
                  placeholder="Unpaid Leave Balance"
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
        <div className="flex flex-row mt-12 w-full justify-center items-center">
          <button
            className="bg-orange hover:bg-darkOrange text-white font-bold py-2 px-4 rounded"
            color="orange"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || isLoadingLeaveBalance}
          >
            {isLoading || isLoadingLeaveBalance ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditEmployee;

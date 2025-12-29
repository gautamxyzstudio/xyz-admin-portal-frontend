/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import DashboardLayout from '../../../../examples/LayoutContainers/DashboardLayout/index.jsx';
import DashboardNavbar from '../../../../examples/Navbars/DashboardNavbar/index.jsx';
import FormTextInput from '../../../../shared/components/formInput/FormInput';
import PickerInput from '../../../../shared/components/pickerInput/PickerInput';
import { Autocomplete, TextField, Card, Grid } from '@mui/material';
import TimePickerInput from '../../../../shared/components/timepickerinput/TimePickerInput';
import MDButton from '../../../../components/MDButton/MDButton';
import MDBox from '../../../../components/MDBox/MDBox';
import MDTypography from '../../../../components/MDTypography';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { useApplyLeaveMutation, useUpdateLeaveMutation } from '../../leavesApi';
import { userInState } from '../../../auth/authSlice';
import { useSelector } from 'react-redux';
import {
  formatDateToMMDDYYYY,
  formatTimeToHHMMSS,
  getError,
  getString,
} from '../../../../utils/utils';
import { useLoadingWrapper } from '../../../../wrappers/loadingWrapper/LoadingWrapper.context.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetEmployeeLeaveBalanceQuery } from '../../../employee/employeeApis';
import { LeaveType } from '../../../../shared/enums.js';

type LeaveForm = {
  title: string;
  description: string;
  leaveDuration: 'short_leave' | 'half_day' | 'full_day';
  leaveType: LeaveType;
  half: string;
  date: dayjs.Dayjs;
  startTime: dayjs.Dayjs | null;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
};


const CreateLeave = () => {
  const location = useLocation();
  const user = useSelector(userInState);
  const { setIsLoading } = useLoadingWrapper();
  const leave = location.state?.leave;
  const { data: leaveBalance, isFetching } = useGetEmployeeLeaveBalanceQuery(
    { id: user?.id?.toString() ?? '' },
    {
      skip: !user,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }
  );

  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching, setIsLoading]);

  const [applyLeave] = useApplyLeaveMutation();
  const [updateLeave] = useUpdateLeaveMutation();
  const navigate = useNavigate();

  const leaveDurations = ['short_leave', 'half_day', 'full_day'] as const;
  const HalfDay = ['First', 'Second'] as const;
  const leaveTypes = Object.values(LeaveType);

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LeaveForm>({
    defaultValues: {
      title: '',
      description: '',
      leaveDuration: leaveDurations[0],
      leaveType: LeaveType.Casual,
      half: HalfDay[0],
      date: dayjs(),
      startTime: null,
      startDate: dayjs(),
      endDate: dayjs(),
    },
  });

  // Populate form if editing a leave
  useEffect(() => {
    if (leave) {
      setValue('title', leave.title);
      setValue('description', leave.description);
      setValue('leaveDuration', leave.leave_duration);
      setValue('leaveType', leave.is_paid ? LeaveType.Casual : LeaveType.UnPaid);
      setValue('date', dayjs(leave.start_date));
      setValue('startTime', leave.start_time ? dayjs(leave.start_time, 'HH:mm:ss') : null);
      setValue('startDate', dayjs(leave.start_date));
      setValue('endDate', dayjs(leave.end_date));
      setValue('half', leave.is_first_half ? 'First' : 'Second');
    }
  }, [leave, setValue]);

  // Calculate number of days for full day leaves
  const leaveDuration = watch('leaveDuration');
  const leaveType = watch('leaveType');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const calculateDays = () => {
    if (leaveDuration === 'full_day' && startDate && endDate) {
      return endDate.diff(startDate, 'day') + 1;
    }
    return 1;
  };

  // Check if user can select Casual leave type
  const canSelectCasual = () => {
    const days = calculateDays();
    return (leaveBalance?.leave_balance || 0) >= days;
  };

  // Auto-switch to Unpaid if insufficient balance for Casual
  useEffect(() => {
    if (leaveType === LeaveType.Casual && !canSelectCasual()) {
      setValue('leaveType', LeaveType.UnPaid);
    }
  }, [leaveType, leaveDuration, startDate, endDate, leaveBalance, setValue]);

  // Auto-set leave type to Casual for short leave
  useEffect(() => {
    if (leaveDuration === 'short_leave') {
      setValue('leaveType', LeaveType.Casual);
    }
  }, [leaveDuration, setValue]);

  // Handle leave update
  const handleUpdateLeave = async (data: LeaveForm) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await updateLeave({
        id: leave.id,
        data: {
          title: data.title,
          description: data.description,
          leave_duration: data.leaveDuration,
          start_date: formatDateToMMDDYYYY(data.date.toDate()),
          end_date: formatDateToMMDDYYYY(data.endDate.toDate()),
          status: leave.status,
          user: user.id,
          decline_reason: '',
          start_time: data.startTime ? formatTimeToHHMMSS(data.startTime) : undefined,
          is_paid: data.leaveType === LeaveType.Casual,
          is_first_half: data.half === 'First',
        },
      }).unwrap();
      if (response) {
        toast.success('Leave updated successfully');
        navigate('/leaves');
      }
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to update leave');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle leave apply
  const handleApplyLeave = async (data: LeaveForm) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await applyLeave({
        data: {
          start_date: formatDateToMMDDYYYY(data.date.toDate()),
          end_date:
            data?.endDate && data?.endDate?.isValid()
              ? formatDateToMMDDYYYY(data.endDate.toDate())
              : formatDateToMMDDYYYY(data.date.toDate()),
          status: 'pending',
          decline_reason: '',
          description: data.description,
          title: data.title,
          leave_type: data.leaveType as 'Casual' | 'Unpaid',
          leave_duration: data.leaveDuration,
          start_time: data.startTime ? formatTimeToHHMMSS(data.startTime) : undefined,
          is_paid: data.leaveType === LeaveType.Casual,
          is_first_half: data.half === 'First',
          user: user.id.toString(),
        },
      }).unwrap();

      if (response) {
        toast.success('Leave applied successfully');
        navigate('/leaves');
      }
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to apply leave');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />

      {/* Leave Balance Display */}
      <MDBox mb={4}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="bold" mb={3}>
              Your Leave Balance
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDBox textAlign="center" p={2} bgcolor="primary.light" borderRadius={2}>
                  <MDTypography variant="h4" fontWeight="bold" color="primary.main">
                    {leaveBalance?.leave_balance || 0}
                  </MDTypography>
                  <MDTypography variant="body2" color="text.secondary">
                    Paid Leave Balance
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDBox textAlign="center" p={2} bgcolor="warning.light" borderRadius={2}>
                  <MDTypography variant="h4" fontWeight="bold" color="warning.main">
                    {leaveBalance?.unpaid_leave_balance || 0}
                  </MDTypography>
                  <MDTypography variant="body2" color="text.secondary">
                    Unpaid Leave Balance
                  </MDTypography>
                </MDBox>
              </Grid>
            </Grid>
            {leaveDuration && leaveDuration !== 'short_leave' && (
              <MDBox mt={2} p={2} bgcolor="info.light" borderRadius={1}>
                <MDTypography variant="body2" color="info.main" textAlign="center">
                  This leave will consume {calculateDays()} day
                  {calculateDays() !== 1 ? 's' : ''}
                  {leaveType === LeaveType.Casual && !canSelectCasual() && (
                    <span style={{ color: 'red' }}>
                      {' '}
                      - Insufficient balance for casual leave
                    </span>
                  )}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        </Card>
      </MDBox>

      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Title */}
        <Controller
          control={control}
          name="title"
          rules={{ required: 'Title is required' }}
          render={({ field }) => (
            <FormTextInput
              label="Title"
              value={getString(field.value)}
              placeholder="Title"
              onChange={field.onChange}
              errorMessage={getError(errors.title)}
            />
          )}
        />
        {/* Description */}
        <Controller
          control={control}
          name="description"
          rules={{ required: 'Description is required' }}
          render={({ field }) => (
            <FormTextInput
              label="Description"
              multiline
              rows={4}
              value={getString(field.value)}
              placeholder="Description"
              onChange={field.onChange}
              errorMessage={getError(errors.description)}
            />
          )}
        />
        {/* Leave Duration */}
        <Controller
          control={control}
          name="leaveDuration"
          render={({ field }) => (
            <Autocomplete
              disablePortal
              options={leaveDurations}
              disableClearable
              freeSolo={false}
              value={field.value}
              onChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Leave Duration"
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
        {/* Leave Type */}
        {leaveDuration !== 'short_leave' && (
          <Controller
            control={control}
            name="leaveType"
            rules={{
              required: 'Leave type is required',
              validate: (value) => {
                if (value === LeaveType.Casual && !canSelectCasual()) {
                  return 'Insufficient leave balance for casual leave';
                }
                return true;
              },
            }}
            render={({ field }) => (
              <Autocomplete
                disablePortal
                options={leaveTypes}
                disableClearable
                freeSolo={false}
                value={field.value}
                onChange={(_, value) => field.onChange(value)}
                getOptionDisabled={(option) => {
                  if (option === LeaveType.Casual) {
                    return !canSelectCasual();
                  }
                  return false;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Leave Type"
                    variant="outlined"
                    fullWidth
                    inputProps={{
                      ...params.inputProps,
                      readOnly: true,
                    }}
                    helperText={
                      !canSelectCasual() && leaveType === LeaveType.Casual
                        ? 'Insufficient leave balance for casual leave'
                        : ''
                    }
                    error={
                      !canSelectCasual() && leaveType === LeaveType.Casual
                    }
                  />
                )}
              />
            )}
          />
        )}
        {/* Date Pickers */}
        {(leaveDuration === 'half_day' || leaveDuration === 'short_leave') && (
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <PickerInput
                label="Start Date"
                value={field.value}
                setValue={field.onChange}
                errorMessage={getError(errors.date)}
              />
            )}
          />
        )}
        {/* Half Day */}
        {leaveDuration === 'half_day' && (
          <Controller
            control={control}
            name="half"
            render={({ field }) => (
              <Autocomplete
                disablePortal
                options={HalfDay}
                disableClearable
                freeSolo={false}
                value={field.value}
                onChange={(_, value) => field.onChange(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Half"
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
        )}
        {/* Short Leave Time Picker */}
        {leaveDuration === 'short_leave' && (
          <Controller
            control={control}
            name="startTime"
            rules={{
              required: 'Start time is required for short leave',
            }}
            render={({ field }) => (
              <TimePickerInput
                label="Start Time"
                value={field.value ?? dayjs()}
                setValue={field.onChange}
                errorMessage={getError(errors.startTime)}
              />
            )}
          />
        )}
        {/* Full Day Date Pickers */}
        {leaveDuration === 'full_day' && (
          <>
            <Controller
              control={control}
              name="startDate"
              rules={{
                required: 'Start date is required',
                validate: (value) => {
                  const endDate = watch('endDate');
                  if (endDate && value && value.isAfter(endDate, 'day')) {
                    return 'Start date must be before or equal to end date';
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <PickerInput
                  label="Start Date"
                  value={field.value}
                  setValue={field.onChange}
                  errorMessage={getError(errors.startDate)}
                />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              rules={{
                required: 'End date is required',
                validate: (value) => {
                  const startDate = watch('startDate');
                  if (startDate && value && value.isBefore(startDate, 'day')) {
                    return 'End date must be after or equal to start date';
                  }
                  return true;
                },
              }}
              render={({ field }) => {
                const startDate = watch('startDate');
                const shouldDisableDate = (date: dayjs.Dayjs) => {
                  return startDate ? date.isBefore(startDate, 'day') : false;
                };

                return (
                  <PickerInput
                    label="End Date"
                    value={field.value}
                    setValue={field.onChange}
                    errorMessage={getError(errors.endDate)}
                    shouldDisableDate={shouldDisableDate}
                  />
                );
              }}
            />
          </>
        )}

        <MDButton
          variant="contained"
          color="orange"
          onClick={handleSubmit(leave?.id ? handleUpdateLeave : handleApplyLeave)}
        >
          {leave?.id ? 'Update' : 'Create Leave'}
        </MDButton>
      </div>
    </>
  );
};

export default CreateLeave;

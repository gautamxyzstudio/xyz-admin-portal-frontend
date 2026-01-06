/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'react-toastify';

import { useLoadingWrapper } from '../../../../wrappers/loadingWrapper/LoadingWrapper.context.js';
import AddHolidayForm from '../../components/addHolidayForm/AddHolidayForm';
import type { IAddHolidayFormData } from '../../holydayList.types';
import { usePostHolidayMutation } from '../../holydayListApi';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const AddHoliday = () => {
  const { setIsLoading } = useLoadingWrapper();
  const [postHoliday] = usePostHolidayMutation();
  const navigation = useNavigate();

  const createHolidayHandler = async (data: IAddHolidayFormData) => {
    try {
      setIsLoading(true);
      const response = await postHoliday({
        data: {
          Name: data.name,
          date: dayjs(data.date).format('YYYY-MM-DD'),
        },
      }).unwrap();

      if (response) {
        toast.success('Holiday created successfully');
        navigation('/holidays');
      }
    } catch (error) {
      toast.error((error as any)?.message ?? 'Something went wrong');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
       <AddHolidayForm onPressSubmit={createHolidayHandler} />
    </>
  );
};

export default AddHoliday;

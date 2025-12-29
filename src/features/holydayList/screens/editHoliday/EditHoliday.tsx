import { toast } from 'react-toastify';
import DashboardLayout from '../../../../examples/LayoutContainers/DashboardLayout/index.jsx';
import DashboardNavbar from '../../../../examples/Navbars/DashboardNavbar/index.jsx';
import { useLoadingWrapper } from '../../../../wrappers/loadingWrapper/LoadingWrapper.context.js';
import EditHolidayForm from '../../components/editHolidayForm/EditHolidayForm';
import type { IAddHolidayFormData, IHoliday } from '../../holydayList.types';
import { usePatchHolidayMutation } from '../../holydayListApi';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

const EditHoliday = () => {
  const { setIsLoading } = useLoadingWrapper();
  const [patchHoliday] = usePatchHolidayMutation();
  const navigation = useNavigate();
  const { holiday } = useLocation()?.state as { holiday: IHoliday };

  const updateHolidayHandler = async (data: IAddHolidayFormData) => {
    try {
      setIsLoading(true);
      const response = await patchHoliday({
        id: holiday.id,
        data: {
          data: {
            Name: data.name,
            date: dayjs(data.date).format('YYYY-MM-DD'),
          },
        },
      }).unwrap();

      if (response) {
        toast.success('Holiday updated successfully');
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
      <DashboardNavbar />
      <EditHolidayForm onPressSubmit={updateHolidayHandler} holiday={holiday} />
    </>
  );
};

export default EditHoliday;

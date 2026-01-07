/* eslint-disable @typescript-eslint/no-explicit-any */

import { toast } from "react-toastify";
import dayjs from "dayjs";

import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import EditHolidayForm from "../../components/editHolidayForm/EditHolidayForm.js";
import type { IAddHolidayFormData, IHoliday } from "../../holydayList.types.js";
import { usePatchHolidayMutation } from "../../holydayListApi.js";

import { Dialog } from "@mui/material";

interface EditHolidayDialogProps {
  holiday: IHoliday;
  open: boolean;
  onClose: () => void;
}

const EditHolidayDialog: React.FC<EditHolidayDialogProps> = ({
  holiday,
  open,
  onClose,
}) => {
  const { setIsLoading } = useLoadingWrapper();
  const [patchHoliday] = usePatchHolidayMutation();

  const updateHolidayHandler = async (data: IAddHolidayFormData) => {
    try {
      setIsLoading(true);
      const response = await patchHoliday({
        id: holiday.id,
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
    <Dialog open={open} onClose={onClose} fullWidth >
      <EditHolidayForm
        onClose={onClose}
        holiday={holiday}
        onPressSubmit={updateHolidayHandler}
      />
      {/* </DialogContent> */}
    </Dialog>
  );
};

export default EditHolidayDialog;

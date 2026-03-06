/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CustomDataTable from "../../shared/components/customDataTable/CustomDataTable";
import LinearGradient from "../LinearGradient/LinearGradient";

interface StatusDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  isLoading: boolean;
}

const StatusDetailsDialog = ({
  open,
  onClose,
  title,
  data,
  isLoading,
}: StatusDetailsDialogProps) => {
  const columns = [
    {
      field: "empCode",
      headerName: "Emp ID",
      width: 80,
    },
    {
      field: "name",
      headerName: "Employee Name",
      flex: 1.5,
      width: 160,
    },

    {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1,
      width: 150,
    }
  ];
  return (
    <Dialog
      PaperProps={{
        sx: { borderRadius: "16px" },
      }}
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className="flex justify-between items-center font-bold">
        {title}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <LinearGradient />
        <div className="h-100 mt-3 ">
          <CustomDataTable
            columns={columns}
            rows={data}
            isLoading={isLoading}
            withPagination={false}
            isDataEmpty={data.length === 0}
            emptyViewTitle="No Employee Found"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusDetailsDialog;

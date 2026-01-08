import React from "react";
import { Dialog, } from "@mui/material";

import AddHolidayForm from "../../components/addHolidayForm/AddHolidayForm";

interface AddHolidayDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddHolidayDialog: React.FC<AddHolidayDialogProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog 
    maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          padding: 0,
        },
      }}
      fullWidth
    open={open} onClose={onClose} >
      {/* <DialogTitle className="flex justify-between items-center"> */}
      {/* <h3 className=""> Add Holiday</h3>

      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton> */}
      {/* </DialogTitle> */}
       <AddHolidayForm onClose={onClose} />
    </Dialog>
  );
};

export default AddHolidayDialog;

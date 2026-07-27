/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState,  } from "react";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import { Link } from "react-router";
import { ChevronLeft } from "@mui/icons-material";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import type { GridColDef } from "@mui/x-data-grid";
import { useGetAllLeaveBalanceQuery, useUpdateLeaveBalanceMutation } from "../../leavesApi"; // ✅ Mutation hook import kiya
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { EditIcon } from "lucide-react";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { toast } from "react-toastify";
 
const LeaveBalances = () => {
  const { data = [], isLoading,refetch } = useGetAllLeaveBalanceQuery(undefined, {
    refetchOnFocus: true,
  });

  const [updateLeaveBalance, { isLoading: isUpdating }] = useUpdateLeaveBalanceMutation(); // ✅ API mutation hook

  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // ✅ Form data state for editing
  const [formData, setFormData] = useState({
    cl_balance: 0,
    el_balance: 0,
    sl_balance: 0,
    unpaid_balance: 0,
  });

  const handleEdit = (rowData: any) => {
    setSelectedEmployee(rowData);
     setFormData({
      cl_balance: rowData.cl_balance,
      el_balance: rowData.el_balance,
      sl_balance: rowData.sl_balance,
      unpaid_balance: rowData.unpaid_balance,
    });
    setOpen(true);
    
  };
console.log(selectedEmployee,"sssdd")
  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
  };

  // ✅ Final Update function
  const handleUpdate = async () => {
    try {
      await updateLeaveBalance({
        id: selectedEmployee.id,  
       data:formData
      }).unwrap();

      toast.success("Leave balance updated successfully!");
      handleClose();
      refetch();
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update balance");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Employee Name",
      width: 150,
      renderCell: (params) => (
        <span className="font-semibold">{params.row.user.username}</span>
      ),
    },
    { field: "cl_balance", headerName: "Casual Leaves", width: 150 },
    { field: "el_balance", headerName: "Annual/Earned Leaves", width: 150 },
    { field: "sl_balance", headerName: "Sick/Medical Leaves", width: 150 },
    { field: "unpaid_balance", headerName: "Unpaid Leaves", width: 150 },
    {
      field: "actions",
      headerName: "Action",
      width: 80,
      renderCell: (params) => (
        <Tooltip title="Edit Balance">
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            size="small"
          >
            <EditIcon size={18} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Link
        to="/all-leaves"
        className="w-full flex flex-row items-center-safe hover:underline hover:text-primary group mb-4 hover:font-semibold"
      >
        <ChevronLeft />
        <span>Back to All Leaves</span>
      </Link>

      <CustomBox customClasses="w-full h-auto flex flex-col gap-y-5 px-5 py-6">
        <h2 className="text-2xl font-semibold">Leaves Balance List</h2>
        <div className="w-full h-[60dvh]">
          <CustomDataTable
            columns={columns}
            rows={data}
            isLoading={isLoading}
            isDataEmpty={data?.length === 0}
            emptyViewTitle="No Leave Balance Found"
            withPagination={false}
          />
        </div>
      </CustomBox>

      {/* --- EDIT DIALOG --- */}
      <Dialog
        open={open}
        PaperProps={{
          sx: { borderRadius: "16px" },
        }}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle className="font-bold">Edit Leave Balance</DialogTitle>

        <LinearGradient />
        <DialogContent className="pt-4">
          {selectedEmployee && (
            <div className="flex flex-col gap-y-4 ">
              <p className="text-sm mb-2">
                Employee Name :
                <span className="font-bold ml-1">
                  {selectedEmployee?.user?.username}
                </span>
              </p>
              <div className="flex gap-3">
                <TextField
                  label="Casual Leaves"
                  type="number"
                  fullWidth
                  value={formData.cl_balance}
                  onChange={(e) => setFormData({ ...formData, cl_balance: Number(e.target.value) })}
                />
                <TextField
                  label="Annual/Earned Leaves"
                  type="number"
                  fullWidth
                  value={formData.el_balance}
                  onChange={(e) => setFormData({ ...formData, el_balance: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-3">
                <TextField
                  label="Sick/Medical Leaves"
                  type="number"
                  fullWidth
                  value={formData.sl_balance}
                  onChange={(e) => setFormData({ ...formData, sl_balance: Number(e.target.value) })}
                />
                <TextField
                  label="Unpaid Leaves"
                  type="number"
                  fullWidth
                  value={formData.unpaid_balance}
                  onChange={(e) => setFormData({ ...formData, unpaid_balance: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </DialogContent>
        <LinearGradient />
        <DialogActions className="flex justify-center mb-2 mr-2 ">
          <CustomButton
            label="Cancel"
            buttonStyle="secondary"
            customStyles="py-2! mt-3 w-[25%]"
            onClick={handleClose}
          />

          <CustomButton
            label={isUpdating ? "Updating..." : "Update Balance"}
            buttonStyle="primary"
            customStyles="py-2! mt-3 w-[45%] "
            disabled={isUpdating}  
            onClick={handleUpdate}  
          />
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default LeaveBalances;
import { useSelector } from "react-redux";
import { userDetailsInState } from "../../auth/authSlice";

import { Icons } from "../../../assets/myAssets/exporter";
import CustomButton from "../../../components/CustomButton/CustomButton";
import StatCard from "../../../shared/components/StatCard/StatCard";
import LeaveRequest from "../components/leaveRequests/LeaveRequest";
import AttendanceTable from "../components/AttendanceTable/AttendanceTable";
import { Dialog, TextField } from "@mui/material";
import { useState } from "react";
import { Close } from "@mui/icons-material";
import LinearGradient from "../../../components/LinearGradient/LinearGradient";

const HrDashboard = () => {
  const user = useSelector(userDetailsInState);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <div className="h-[70vh]">
        {/* ================= HEADER ================= */}
        <div className="w-full relative overflow-clip rounded-2xl bg-primary flex items-center justify-between py-11 px-8">
          <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-36.25 -top-39 opacity-20" />
          <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-32.25 -top-35 opacity-10" />

          <div className="flex flex-col gap-y-2 text-background z-10">
            <h2 className="text-[32px] leading-10 font-semibold">
              Hey! {user?.name}
            </h2>
            <p className="text-white text-base opacity-80">
              Check your Attendance
            </p>
          </div>

          <div className="w-65.75 h-65.75 bg-white rounded-full absolute -right-36.25 -top-39 opacity-20" />
          <div className="w-65.75 h-65.75 bg-white rounded-full absolute -right-32.25 -top-35 opacity-10" />

          <CustomButton
            label="Add Announcements"
            icon={<img src={Icons.PLUS_ICON} alt="plus icon" />}
            customStyles="bg-white text-primary z-10 border-none!"
            buttonStyle="primaryOutline"
            onClick={handleOpen}
          />
        </div>

        {/* ================= STATS ================= */}
        <div className="flex gap-5 mt-5">
          <StatCard
            title="Total Employee"
            value="4"
            iconSrc={Icons.TOTAL_EMP}
            iconBgColor="bg-[#49B6791A]"
          />
          <StatCard
            title="Today Presents"
            value="4"
            iconSrc={Icons.PRESENTS_EMP}
            iconBgColor="bg-[#2F4CBA1A]"
          />
          <StatCard
            title="Today Leaves"
            value="4"
            iconSrc={Icons.TOTAL_LEAVE}
            iconBgColor="bg-[#6CADDD1A]"
          />
          <StatCard
            title="Today Absent"
            value="4"
            iconSrc={Icons.TODAYABSENT}
            iconBgColor="bg-[#FF00001A]"
          />
        </div>
        <div className="flex gap-5 flex-col">
          <AttendanceTable />
          <LeaveRequest />
        </div>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            padding: "12px",
            display: "flex",
            gap: "10px",
          },
        }}
      >
        <div className="flex justify-between mb-2">
          <h3 className="text-xl font-semibold leading-7">
            Add Announcements{" "}
          </h3>
          <Close
            className="cursor-pointer"
            onClick={() => {
              handleClose();
            }}
          />
        </div>
        <LinearGradient />
        <div className="flex flex-col gap-5 mt-3 mb-3">
          <TextField
            label="Title"
            // value={sea}
            // onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="title"
            className="w-full"
          />
          <TextField
            label="Description"
            // value={sea}
            // onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Description"
            className="w-full"
          />

          <TextField
            className="w-full "
            label="Date"
            type="date"
            // value={}
            // onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            // inputProps={{ min: minDate, max: maxDate }}
          />
        </div>
        <LinearGradient />
        
        <div className="flex gap-3 mt-3 ">
          <CustomButton
            customStyles="w-30"
            label="Create"
            onClick={() => {
              handleClose();
            }}
          />
          <CustomButton
            label="Cancel"
            customStyles="w-30"
            buttonStyle="secondary"
            onClick={handleClose}
          />
        </div>
      </Dialog>
    </>
  );
};

export default HrDashboard;

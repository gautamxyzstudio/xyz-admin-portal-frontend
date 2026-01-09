import { userDetailsInState, userInState } from "../../auth/authSlice";
import { Icons } from "../../../assets/myAssets/exporter";
import CustomButton from "../../../components/CustomButton/CustomButton";
import StatCard from "../../../shared/components/StatCard/StatCard";
import LeaveRequest from "../components/leaveRequests/LeaveRequest";
import AttendanceTable from "../components/AttendanceTable/AttendanceTable";
import { Dialog, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Close } from "@mui/icons-material";
import LinearGradient from "../../../components/LinearGradient/LinearGradient";
import axios from "axios";
import { apiendpoint } from "../../../api/endpoint";
import { useAppSelector } from "../../../state/store";

import { useForm, Controller } from "react-hook-form";
import PickerInput from "../../../shared/components/pickerInput/PickerInput";
import dayjs from "dayjs";

interface DashboardStats {
  totalEmployees: number;
  presentEmployees: number;
  employeesOnLeave: number;
  absentEmployees: number;
}

type AnnouncementPayload = {
  title: string;
  description: string;
  date: string;
};

const HrDashboard = () => {
  const user = useAppSelector(userInState);
  const userDetail = useAppSelector(userDetailsInState);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  //  useForm
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementPayload>({
    defaultValues: { title: "", description: "", date: "" },
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(apiendpoint.getDashboardStats);
        setStats(res.data);
      } catch (error) {
        console.error("Stats API error", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset();
  };

  // Handle announcement creation
  const handleCreateAnnouncement = async (data: AnnouncementPayload) => {
    try {
      setLoading(true);

      await axios.post(
        apiendpoint.getAnnouncements,
        {
          data: {
            Title: data.title,
            Description: data.description,
            Date: data.date,
          },
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      handleClose();
    } catch (error) {
      console.error("Announcement POST error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-[70vh]">
        {/* HEADER */}
        <div className="w-full relative overflow-clip rounded-2xl bg-primary flex items-center justify-between py-11 px-8">
          <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-36.25 -top-39 opacity-20" />
          <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-32.25 -top-35 opacity-10" />
          <div className="flex flex-col gap-y-2 text-background z-10">
            <h2 className="text-[32px] leading-10 font-semibold">
              Hey! {userDetail?.name}
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

        {/* STATS */}
        <div className="flex gap-5 mt-5">
          <StatCard
            title="Total Employee"
            value={stats.totalEmployees.toString()}
            iconSrc={Icons.TOTAL_EMP}
            iconBgColor="bg-[#49B6791A]"
          />
          <StatCard
            title="Today Presents"
            value={stats.presentEmployees.toString()}
            iconSrc={Icons.PRESENTS_EMP}
            iconBgColor="bg-[#2F4CBA1A]"
          />
          <StatCard
            title="Today Leaves"
            value={stats.employeesOnLeave.toString()}
            iconSrc={Icons.TOTAL_LEAVE}
            iconBgColor="bg-[#6CADDD1A]"
          />
          <StatCard
            title="Today Absent"
            value={stats.absentEmployees.toString()}
            iconSrc={Icons.TODAYABSENT}
            iconBgColor="bg-[#FF00001A]"
          />
        </div>

        <div className="flex  flex-col">
          <AttendanceTable />
          <LeaveRequest />
        </div>
      </div>

      {/* ANNOUNCEMENT DIALOG */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            padding: "12px",
            display: "flex",
            borderRadius: "12px",
            gap: "10px",
          },
        }}
      >
        <div className="flex justify-between mb-1">
          <h3 className="text-xl font-semibold leading-7">Add Announcements</h3>
          <Close className="cursor-pointer" onClick={handleClose} />
        </div>

        <LinearGradient />

        <form
          onSubmit={handleSubmit(handleCreateAnnouncement)}
          className="flex flex-col gap-5"
        >
          <Controller
            name="title"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="date"
            control={control}
            rules={{ required: "Date is required" }}
            render={({ field }) => (
              <PickerInput
                label="Date"
                value={field.value ? dayjs(field.value) : null}
                setValue={(date) =>
                  field.onChange(date ? date.toISOString() : "")
                }
                disablePast
                popperPlacement="top-end"
                errorMessage={errors.date?.message ?? ""}
              />
            )}
          />

          <LinearGradient />

          <div className="flex gap-3">
            <CustomButton
              customStyles="w-30"
              label={loading ? "Creating...." : "Create"}
              type="submit"
              disabled={loading}
            />

            <CustomButton
              label="Cancel"
              customStyles="w-30"
              buttonStyle="secondary"
              onClick={handleClose}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default HrDashboard;

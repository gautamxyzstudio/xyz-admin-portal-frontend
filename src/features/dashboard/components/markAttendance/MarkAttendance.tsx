/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { TbLogin, TbLogin2 } from "react-icons/tb";
import { Icons } from "../../../../assets/myAssets/exporter";
import dayjs from "dayjs";
import Swal from "sweetalert2";

interface Props {
  inTime: string | null;
  outTime: string | null;
  isCheckedIn: boolean;
  attendanceSeconds: number;
  checkinStartedAt: string | null;
  handleCheckIn: (time: Date) => void;
  handleCheckOut: (time: Date) => void;
}

const MarkAttendance = ({
  inTime,
  outTime,
  isCheckedIn,
  attendanceSeconds,
  checkinStartedAt,
  handleCheckIn,
  handleCheckOut,
}: Props) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(attendanceSeconds);

  useEffect(() => {
    if (!isCheckedIn || !checkinStartedAt) {
      setElapsedSeconds(attendanceSeconds);
      return;
    }

    const startedAt = new Date(checkinStartedAt).getTime();
    if (isNaN(startedAt)) return;

    const tick = () => {
      const liveSeconds = Math.floor((Date.now() - startedAt) / 1000);
      setElapsedSeconds(attendanceSeconds + Math.max(0, liveSeconds));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isCheckedIn, checkinStartedAt, attendanceSeconds]);

  // 2. Check In with SweetAlert
  const onConfirmCheckIn = async () => {
    const result = await Swal.fire({
      title: "Check In?",
      text: "Do you want to start your attendance?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Check In",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#FF7D00",
      cancelButtonColor: "#E0E0E0",
      customClass: {
        popup: "swal-rounded-popup",
        confirmButton: "swal-rounded-button",
        cancelButton: "swal-rounded-button",
      },
    });

    if (result.isConfirmed) {
      handleCheckIn(new Date());
    }
  };

  // 2. Join (Resume)
  const handleJoin = async () => {
    const result = await Swal.fire({
      title: "Join Back?",
      text: "Are you ready to resume your work?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, Join",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#FF7D00",
      cancelButtonColor: "#E0E0E0",
      customClass: {
        popup: "swal-rounded-popup",
        confirmButton: "swal-rounded-button",
        cancelButton: "swal-rounded-button",
      },
    });

    if (result.isConfirmed) {
      handleCheckIn(new Date());
    }
  };

  // 3. Check Out
  const onConfirmCheckOut = async () => {
    const result = await Swal.fire({
      title: "Check Out?",
      text: "Are you sure you want to end your shift for today?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Check Out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#FF7D00",
      cancelButtonColor: "#E0E0E0",
      customClass: {
        popup: "swal-rounded-popup",
        confirmButton: "swal-rounded-button",
        cancelButton: "swal-rounded-button",
      },
    });

    if (result.isConfirmed) {
      handleCheckOut(new Date());
    }
  };
  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");

  return (
    <CustomBox customClasses="w-[28%] h-full flex flex-col items-center p-4 justify-between">
      {/* Header */}
      <div className="w-full flex flex-col items-center gap-y-2">
        <h3 className="text-xl font-semibold">Daily Attendance</h3>
        <LinearGradient />
        <p className="text-base">{dayjs().format("dddd DD MMMM, YYYY")}</p>
      </div>

      {/* Timer */}
      <div className="mt-5 flex gap-x-4 w-full">
        {[hours, minutes, seconds].map((v, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="bg-background p-2 rounded-lg text-4xl font-bold">
              {v}
            </div>
            <p className="text-sm text-black-50">
              {["Hours", "Minutes", "Seconds"][i]}
            </p>
          </div>
        ))}
      </div>
      <p className="text-base">Clock</p>

      {/* Buttons */}
      <div className="mt-5 w-full flex flex-col gap-y-3">
        {/* Initial Check In */}
        {!inTime && !outTime && (
          <CustomButton
            label="Check In"
            onClick={onConfirmCheckIn}
            icon={<TbLogin2 size={32} />}
          />
        )}

        {/* After Break → Join */}
        {inTime && !isCheckedIn && !outTime && (
          <CustomButton
            label="Join"
            onClick={handleJoin}
            icon={<TbLogin2 size={32} />}
          />
        )}

        {/* Working → Checkout */}
        {isCheckedIn && !outTime && (
          <CustomButton
            label="Check Out"
            onClick={onConfirmCheckOut}
            icon={<TbLogin size={32} />}
          />
        )}

        {outTime && (
          <CustomButton
            label="All done for today!"
            disabled
            buttonStyle="disabled"
          />
        )}

        {/* Office Info */}
        <div className="bg-background p-2 rounded-md flex items-center gap-x-2">
          <img src={Icons.OFFICE} alt="office" className="w-6 h-6" />
          <span className="text-primary text-sm">Office</span>
          <p className="text-black-50 text-sm">09:00AM – 06:00PM</p>
        </div>
      </div>
    </CustomBox>
  );
};

export default MarkAttendance;

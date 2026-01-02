import { useEffect, useState } from "react";
import { timeStringToDate } from "../../../../utils/utils";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { TbLogin, TbLogin2 } from "react-icons/tb";
import { Icons } from "../../../../assets/myAssets/exporter";

const MarkAttendance = ({
  inTime,
  outTime,
  handleCheckIn,
  handleCheckOut,
}: {
  inTime: string | null;
  outTime: string | null;
  handleCheckIn: (time: Date) => void;
  handleCheckOut: (time: Date) => void;
}) => {
  // const inTimeDate = inTime ? timeStringToDate(inTime) : null;
  // const outTimeDate = outTime ? timeStringToDate(outTime) : new Date();
  // const initialElapsedTime = inTimeDate
  //   ? Math.floor((outTimeDate.getTime() - inTimeDate.getTime()) / 60000)
  //   : 0;

  // const [elapsedMinutes, setElapsedMinutes] = useState(initialElapsedTime);

  // useEffect(() => {
  //   setElapsedMinutes(initialElapsedTime);
  // }, [initialElapsedTime]);

  // useEffect(() => {
  //   let timer: NodeJS.Timeout;
  //   if (inTime && !outTime) {
  //     timer = setInterval(() => {
  //       setElapsedMinutes((prev) => prev + 1);
  //       console.log('Timer updated:', elapsedMinutes + 1);
  //     }, 60000); // Update every minute
  //   }
  //   return () => clearInterval(timer);
  // }, [inTime, outTime, elapsedMinutes]);

  const inTimeDate = inTime ? timeStringToDate(inTime) : null;
  const outTimeDate = outTime ? timeStringToDate(outTime) : new Date();

  const initialElapsedSeconds = inTimeDate
    ? Math.floor((outTimeDate.getTime() - inTimeDate.getTime()) / 1000)
    : 0;

  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds);

  useEffect(() => {
    setElapsedSeconds(initialElapsedSeconds);
  }, [initialElapsedSeconds]);

  useEffect(() => {
    if (!inTime || outTime) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000); // ✅ update every second

    return () => clearInterval(timer);
  }, [inTime, outTime]);

  const hours = Math.floor(elapsedSeconds / 3600)
    .toString()
    .padStart(2, "0");

  const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");

  return (
    <CustomBox customClasses="w-[28%] h-full flex flex-col items-center p-4 text-black">
      <div className="w-full flex flex-col items-center gap-y-2">
        <h3 className="text-xl font-semibold">Daily Attendance</h3>
        <LinearGradient />
        <p className="text-base">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      {/* Timer Clock */}
      <div className="mt-4.5 w-full flex flex-col gap-y-2.5 items-center">
        <div className="w-full flex flex-row flex-nowrap gap-x-4">
          <div className="w-full flex flex-col items-center">
            <div className="w-full text-center bg-background p-2.5 rounded-lg font-bold text-4xl leading-11">
              {hours}
            </div>
            <p className="text-black-50 text-sm">Hours</p>
          </div>
          <div className="w-full flex flex-col items-center">
            <div className="w-full text-center bg-background p-2.5 rounded-lg font-bold text-4xl leading-11">
              {minutes}
            </div>
            <p className="text-black-50 text-sm">Minutes</p>
          </div>
          <div className="w-full flex flex-col items-center">
            <div className="w-full text-center bg-background p-2.5 rounded-lg font-bold text-4xl leading-11">
              {seconds}
            </div>
            <p className="text-black-50 text-sm">Seconds</p>
          </div>
        </div>
        <p className="text-base">Clock</p>
      </div>
      {/* Button */}
      <div className="mt-4.5 flex flex-col gap-y-3 w-full">
        {!inTime && !outTime && (
          <CustomButton
            label="Check In"
            onClick={() => handleCheckIn(new Date())}
            icon={<TbLogin2 size={32} />}
            customStyles="w-full py-3.5!"
          />
        )}
        {inTime && !outTime && (
          <CustomButton
            label="Check Out"
            onClick={() => handleCheckOut(new Date())}
            icon={<TbLogin size={32} />}
            customStyles="w-full py-3.5!"
          />
        )}
        {inTime && outTime && (
          <CustomButton
            label="All done for today!"
            disabled
            buttonStyle="disabled"
            customStyles="w-full py-3.5!"
          />
        )}
        <div className="bg-background p-2 rounded-md flex flex-row gap-x-1.5 flex-nowrap items-center w-full">
          <div className="flex flex-row flex-nowrap gap-x-0.5 items-center">
            <img className="w-6 h-6" alt="office" src={Icons.OFFICE} />
            <span className="text-primary text-sm">Office</span>
          </div>
          <p className="text-black-50 text-sm">09:00AM to 06:00PM</p>
        </div>
      </div>
    </CustomBox>
  );
};

export default MarkAttendance;

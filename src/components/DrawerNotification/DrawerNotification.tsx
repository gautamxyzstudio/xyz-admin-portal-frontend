import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import LinearGradient from "../LinearGradient/LinearGradient";

type Props = {
  open: boolean;
  onClose: () => void;
};

const notifications = [
  {
    title: "Your leaves request",
    desc: "Your leave request is approve by HR Management",
    time: "10 Min",
    active: true,
  },
  {
    title: "Emergency leave",
    desc: "Your emergency leave has been granted.",
    time: "20 Min",
  },
  {
    title: "Sick leave application",
    desc: "Your sick leave has been approved.",
    time: "5 Min",
  },
  {
    title: "Personal leave",
    desc: "Your personal leave request is being processed.",
    time: "25 Min",
  },
  {
    title: "Conference leave",
    desc: "Your conference leave is approved.",
    time: "12 Min",
  },
  {
    title: "Conference leave",
    desc: "Your conference leave is approved.",
    time: "12 Min",
  },
  {
    title: "Conference leave",
    desc: "Your conference leave is approved.",
    time: "12 Min",
  },
  {
    title: "Conference leave",
    desc: "Your conference leave is approved.",
    time: "12 Min",
  },
];

const DrawerNotification = ({ open, onClose }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          borderTopLeftRadius: "20px",
          borderBottomLeftRadius: "20px",
        },
      }}
    >
      <div className="rounded-2xl p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-black leading-7">
              Notification
            </h3>
            <span className="text-xs text-gray-400">(01)</span>
          </div>

          <button onClick={onClose}>
            <CloseIcon
              className="text-gray-400 cursor-pointer"
              fontSize="small"
            />
          </button>
        </div>
        <LinearGradient />

        {/* Notifications */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1 mt-2">
          {notifications.map((item, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`rounded-xl p-3 cursor-pointer transition
                ${index === activeIndex ? "bg-gray-100" : "bg-white "}
              `}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">{item.title}</p>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default DrawerNotification;

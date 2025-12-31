import { Typography } from "@mui/material";
import React from "react";
import CustomBox from "../../../components/CustomBox/CustomBox";

interface StatCardProps {
  title: string;
  value: string | number;
  iconSrc?: string;
  bgColor?: string;
  iconBgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconSrc,
  iconBgColor,
}) => {
  return (
    <CustomBox customClasses="w-full px-4 py-4">
      <div className="flex justify-between">
        {/* Text */}
        <Typography
          sx={{
            fontSize: "14px",
            color: "#6B7280",
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
 
        {iconSrc && (
          <img
            src={iconSrc}
            alt="icon"
            className={`${iconBgColor} p-2 rounded-lg `}
          />
        )}
      </div>
      <Typography
        sx={{
          fontSize: "32px",
          fontWeight: 700,
          marginTop: "28px",
        }}
      >
        {value}
      </Typography>
    </CustomBox>
  );
};

export default StatCard;

import React from "react";
import CustomBox from "../../../components/CustomBox/CustomBox";

interface StatCardProps {
  title: string;
  value: string;
  iconSrc?: string;
  bgColor?: string;
  iconBgColor?: string;
  subTitle?: string;
  subTitleColor?: string;
  subTitleBgColor?: string;
  dashboard?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconSrc,
  iconBgColor,
  subTitle,
  subTitleColor,
  subTitleBgColor,
  dashboard,
}) => {
  return (
    <CustomBox customClasses="w-full p-5">
      <div className="flex items-start justify-between w-full">
        {/* Text */}
        <p className="text-base text-black">{title}</p>

        {iconSrc && (
          <img
            src={iconSrc}
            alt="icon"
            className={`${iconBgColor} p-2 rounded-lg w-13 h-13`}
          />
        )}
      </div>
      <p
        className={`${
          dashboard ? "text-2xl font-semibold mt-6" : "text-4xl font-bold mt-5"
        }`}
      >
        {value}
      </p>
      {subTitle && (
        <p
          className={`${subTitleColor} ${subTitleBgColor} text-sm p-2 rounded-lg w-full text-center mt-1.5`}
        >
          {subTitle}
        </p>
      )}
    </CustomBox>
  );
};

export default StatCard;

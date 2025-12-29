import React from "react";

interface CustomButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  buttonStyle?: "primary" | "secondary" | "disabled";
  customStyles?: string;
  type?: "button" | "reset" | "submit";
}

const getButtonStyles = (style: "primary" | "secondary" | "disabled") => {
  switch (style) {
    case "primary":
      return `bg-primary text-white`;
    case "secondary":
      return `bg-background text-black-50`;
    case "disabled":
      return `bg-gray-400 text-gray-200 cursor-not-allowed`;
  }
};
const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  icon,
  onClick,
  buttonStyle = "primary",
  disabled = false,
  customStyles,
  type,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${getButtonStyles(
        buttonStyle
      )} ${customStyles} flex items-center justify-center gap-x-2 px-4 py-2 rounded-md font-bold text-base leading-6 transition-opacity duration-200 cursor-pointer`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export default CustomButton;

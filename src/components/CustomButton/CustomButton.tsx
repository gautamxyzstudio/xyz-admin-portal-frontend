import React from "react";

interface CustomButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  buttonStyle?: "primary" | "secondary" | "disabled" | "primaryOutline";
  customStyles?: string;
  type?: "button" | "reset" | "submit";
}

const getButtonStyles = (
  style: "primary" | "secondary" | "disabled" | "primaryOutline"
) => {
  switch (style) {
    case "primary":
      return `bg-primary text-white cursor-pointer`;
    case "secondary":
      return `bg-background text-black-50 cursor-pointer`;
    case "disabled":
      return `bg-gray-300 text-white cursor-not-allowed`;
    case "primaryOutline":
      return `bg-white text-primary border border-2   cursor-pointer`;
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
      )} ${customStyles} flex items-center justify-center gap-x-1 px-4 py-2 rounded-md font-bold text-base leading-6 transition-opacity duration-200`}
    >
      {icon && <span>{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  );
};

export default CustomButton;

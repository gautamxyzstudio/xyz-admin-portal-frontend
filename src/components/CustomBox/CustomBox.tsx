import React from "react";

const CustomBox = ({
  children,
  customClasses,
}: {
  children: React.ReactNode;
  customClasses?: string;
}) => {
  return <div className={`bg-white rounded-2xl ${customClasses}`}>{children}</div>;
};

export default CustomBox;

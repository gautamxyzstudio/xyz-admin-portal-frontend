import React from "react";

const CustomBox = ({
  children,
  customClasses,
  compRef,
}: {
  children: React.ReactNode;
  customClasses?: string;
  compRef?: React.Ref<HTMLDivElement>;
}) => {
  return (
    <div ref={compRef} className={`bg-white rounded-2xl ${customClasses}`}>
      {children}
    </div>
  );
};

export default CustomBox;

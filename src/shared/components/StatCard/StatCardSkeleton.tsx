import CustomBox from "../../../components/CustomBox/CustomBox";

const StatCardSkeleton = ({ dashboard = false }) => {
  return (
    <CustomBox customClasses="w-full p-5">
      <div className="flex items-start justify-between w-full">
        <div className="animate-pulse bg-background h-4 w-32"></div>
        <div className="animate-pulse bg-background h-13 w-13 rounded-lg"></div>
      </div>

      <div
        className={`animate-pulse bg-background mt-6 ${
          dashboard ? "h-7 w-20" : "h-10 w-28"
        }`}
      ></div>

      <div className="animate-pulse bg-background h-6 w-full mt-2"></div>
    </CustomBox>
  );
};

export default StatCardSkeleton;

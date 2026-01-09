import type { IActivityIndicatorProps } from "./ActivityIndicator.types";
import { ThreeDot } from "react-loading-indicators";

const ActivityIndicator: React.FC<IActivityIndicatorProps> = () => {
  return (
    <div role="status" className="flex justify-center items-center">
      <ThreeDot color={"white"} size="small" text="" textColor="" />
    </div>
  );
};

export default ActivityIndicator;

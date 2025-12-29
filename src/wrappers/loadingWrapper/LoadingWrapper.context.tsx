/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import styles from "./loading.module.css";
import loadingVideo from "../../assets/myassets/videos/loading.mp4";

export const LoadingWrapperContext = createContext({
  isLoading: false,
  setIsLoading: (_isLoading: boolean) => {},
});

export const LoadingWrapperProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingWrapperContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && (
        <div className={styles.loadingWrapper}>
          <video
            className="w-60 h-60 object-contain"
            src={loadingVideo}
            autoPlay
            loop
            muted
          />
        </div>
      )}
    </LoadingWrapperContext.Provider>
  );
};

export const useLoadingWrapper = () => {
  return useContext(LoadingWrapperContext);
};

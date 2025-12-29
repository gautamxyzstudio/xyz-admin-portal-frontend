const LinearGradient = ({
  customClasses,
  vr,
}: {
  customClasses?: string;
  vr?: boolean;
}) => {
  return vr ? (
    // Vertical line
    <div
      className={`bg-[linear-gradient(to_top,rgba(241,124,4,0)_0%,rgba(241,124,4,1)_50%,rgba(241,124,4,0)_100%)] h-4  w-px ${
        customClasses ? customClasses : "mx-1 h-4"
      }`}
    />
  ) : (
    // Horizontal line
    <div
      className={`bg-[linear-gradient(to_right,rgba(241,124,4,0)_0%,rgba(241,124,4,1)_50%,rgba(241,124,4,0)_100%)] w-full h-px ${
        customClasses ? customClasses : "my-1"
      }`}
    />
  );
};
 
export default LinearGradient;
 
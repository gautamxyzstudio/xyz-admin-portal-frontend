type props = {
  title: string;
};

const EmployeeDesignationRow = ({ title }:props) => {
  return (
    <span className="text-xs font-medium text-gray-700">
      {title || "-"}
    </span>
  );
};

export default EmployeeDesignationRow;

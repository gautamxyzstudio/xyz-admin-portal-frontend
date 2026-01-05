type EmployeeTableRowProps = {
  image: string;
  name: string;
  email: string;
};

const EmployeeTableRow = ({name }: EmployeeTableRowProps) => {
  return (
    <div className="flex items-center gap-3">
      {/* <img
        src={image}
        alt={name}
        className="w-12 h-12 rounded-full object-cover"
      /> */}

      <div className="leading-tight">
        <p className="text-xs font-semibold capitalize text-gray-900">
          {name}
        </p>
        {/* <p className="text-xs text-gray-500">
          {email}
        </p> */}
      </div>
    </div>
  );
};

export default EmployeeTableRow;

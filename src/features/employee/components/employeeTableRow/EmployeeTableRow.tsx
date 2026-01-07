type EmployeeTableRowProps = {
  image?: string;
  name: string;
  email?: string;
  showImage?: boolean;
  showEmail?: boolean;
};

const EmployeeTableRow = ({
  name,
  image,
  email,
  showImage = true,
  showEmail = true,
}: EmployeeTableRowProps) => {
  return (
    <div className="flex items-center gap-3">
      {showImage && image && (
        <img
          src={image}
          alt={name}
          className="w-13 h-13 rounded-xl shadow object-cover"
        />
        
      )}

      <div className="leading-tight">
        <p className="text-xs font-semibold capitalize text-gray-900">{name}</p>

        {showEmail && email && <p className="text-xs text-gray-900">{email}</p>}
      </div>
    </div>
  );
};

export default EmployeeTableRow;

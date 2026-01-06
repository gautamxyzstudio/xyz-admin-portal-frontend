interface EmployeeStatusRowProps {
  status: boolean;
}

const EmployeeStatusRow = ({ status }: EmployeeStatusRowProps) => (
  <div className="text-[10px] text-white font-medium">
    {status ? "Active" : "Inactive"}
  </div>
);

export default EmployeeStatusRow;

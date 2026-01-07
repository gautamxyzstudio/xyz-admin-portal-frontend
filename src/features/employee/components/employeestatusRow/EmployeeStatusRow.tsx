interface EmployeeStatusRowProps {
  status: boolean;
}

const EmployeeStatusRow = ({ status }: EmployeeStatusRowProps) => (
 <div
  className={`text-[12px] font-normal px-2 py-0.5 rounded-[22px] inline-block
    ${status ? "bg-lightGreen text-green" : "bg-lightRed text-red"}
  `}
>
  {status ? "Active" : "Inactive"}
</div>

);

export default EmployeeStatusRow;

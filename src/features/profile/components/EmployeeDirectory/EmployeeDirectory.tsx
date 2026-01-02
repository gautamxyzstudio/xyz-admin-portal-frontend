import React from "react";
import { useSelector } from "react-redux";
import { useGetEmployeeListQuery } from "../../../employee/employeeApis";
import type { IEmployee } from "../../../employee/types";
import { employeeListInState } from "../../../employee/employeeSlice";
import { userInState } from "../../../auth/authSlice";
import { Icons } from "../../../../assets/myAssets/exporter";

interface EmployeeDirectoryProps {
  userType?: string;
}

const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  userType = "Employee",
}) => {
  const { isLoading: isLoadingEmployees } = useGetEmployeeListQuery({
    user_type: userType,
  });

  const employeeList = useSelector(employeeListInState);
  const currentUser = useSelector(userInState);

  const filteredEmployeeList = employeeList?.filter(
    (employee: IEmployee) => employee.id !== currentUser?.id
  );

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Employee Directory</h3>

      {isLoadingEmployees ? (
        <div className="flex justify-center items-center p-6 text-gray-500">
          Loading employees...
        </div>
      ) : (
        <div className="max-h-150 overflow-y-auto  flex gap-2 flex-col bg-white">
          {filteredEmployeeList?.map((employee: IEmployee) => (
            <div
              key={employee.id}
              className="flex  gap-4 p-4 items-start bg-[#F7F7F7]  rounded-2xl"
            >
              {/* Avatar */}
              <img
                src={employee?.image ?? "/static/images/avatar/default.jpg"}
                alt={employee.name}
                className="w-14 h-14 rounded-full object-cover"
              />

              {/* Info */}
              <div className="flex w-full justify-between items-center">
                <div className="flex flex-col">
                  <h4 className="font-semibold text-base">{employee.name}</h4>

                  <p className="text-sm text-gray-500">
                    {employee.designation}
                  </p>
                </div>

                <div className="flex flex-col   ">
                  <div className="flex items-center gap-1 mt-1">
                    <img
                      className="bg-[#FFE4CA] rounded-sm p-2 w-8 h-8  "
                      onClick={() => handleEmailClick(employee.email)}
                      src={Icons.OUTLOOK_PRIMARY}
                      alt=""
                    />
                    <span className="text-sm text-gray-500">
                      {employee.email}
                    </span>
                  </div>

                  <p className="text-sm flex gap-2 items-center text-gray-500 mt-1">
                    <img
                      className="bg-[#FFE4CA] rounded-sm p-2 w-8 h-8 "
                      src={Icons.CALL_ICON}
                      alt=""
                    />
                    {employee.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {!filteredEmployeeList?.length && (
            <div className="p-6 text-center text-gray-500">
              No employees found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;

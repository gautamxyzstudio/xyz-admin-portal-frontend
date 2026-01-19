/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useSelector } from "react-redux";
import OwnDocs from "../ownDocs/OwnDocs";
import { userInState } from "../../../auth/authSlice";
import { employeeListInState } from "../../../employee/employeeSlice";
import { useGetEmployeeListQuery } from "../../../employee/employeeApis";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Icons } from "../../../../assets/myAssets/exporter";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
type SelectedEmployee = {
  id: number;
  name: string;
};

const AllEmployeeDocs = () => {
  const user = useSelector(userInState);
  const employeeList = useSelector(employeeListInState);

  const [selectedEmployee, setSelectedEmployee] =
    useState<SelectedEmployee | null>(null);

  // Fetch employee list
  useGetEmployeeListQuery({ user_type: user?.user_type ?? "" });

  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee({
      id: employee.id,
      name: employee.name,
    });
  };

  return (
    <CustomBox customClasses="p-6 w-full h-full flex flex-col">
      {!selectedEmployee ? (
        <div className="w-full h-full flex flex-col  gap-y-4">
          <h2 className="text-xl font-semibold">Select an Employee</h2>

          {employeeList && employeeList.length > 0 && user?.id ? (
            <div className="space-y-3 flex flex-col w-full overflow-y-scroll scrollbar-hide h-full">
              {employeeList
                .filter((employee) => employee.id !== user.id)
                .map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => handleEmployeeClick(employee)}
                    className="flex items-center justify-between p-4 bg-background rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          employee.image || "/static/images/avatar/default.jpg"
                        }
                        alt={employee.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />

                      <div className="">
                        <p className="font-semibold text-black">
                          {employee.name}
                        </p>
                        <p className="text-sm flex gap-2 text-black-80 leading-3.5 mt-1.5">
                          • {employee.designation}{" "}
                          <img src={Icons.TICK} alt="" /> {employee.email}
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-3.5 text-sm text-primary font-bold  bg-primary-20  rounded-md ">
                      <VisibilityIcon
                        className="text-primary"
                        fontSize="small"
                      />
                      View Document
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className=" text-primary text-2xl ">Loading.........</p>
          )}
        </div>
      ) : (
        <>
          <div className="">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="flex items-center gap-1 text-sm font-bold text-primary cursor-pointer"
            >
              <ArrowBackIcon className="font-bold" fontSize="small" />
              Back
            </button>
          </div>
          <div className="w-full h-full overflow-scroll scrollbar-hide bg-white">
            <OwnDocs
              userId={selectedEmployee.id}
              canDelete
              employeeName={selectedEmployee.name}
            />
          </div>
        </>
      )}
    </CustomBox>
  );
};

export default AllEmployeeDocs;

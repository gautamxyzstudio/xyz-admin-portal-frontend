/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { GridColDef } from "@mui/x-data-grid";
import EmployeeTableRow from "../../components/employeeTableRow/EmployeeTableRow";
import {
  useDeleteEmployeeMutation,
  useDeleteUserMutation,
  useGetEmployeeListQuery,
} from "../../employeeApis";
import { userInState } from "../../../auth/authSlice";
import { employeeListInState } from "../../employeeSlice";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable.js";
import EmployeeDesignationRow from "../../components/employeeDesignationRow/EmployeeDesignationRow.js";
import EmployeeStatusRow from "../../components/employeestatusRow/EmployeeStatusRow.js";
import CustomBox from "../../../../components/CustomBox/CustomBox.js";
import { Icons } from "../../../../assets/myAssets/exporter.js";
import CustomButton from "../../../../components/CustomButton/CustomButton.js";
import { TbPlus, TbX } from "react-icons/tb";
import dayjs from "dayjs";
import { useState, useMemo, useRef, useEffect } from "react";
import { UserCheck, UserX, Users } from "lucide-react";
import { ImSearch } from "react-icons/im";

const EmployeeList = () => {
  const user = useSelector(userInState);
  const employeeList = useSelector(employeeListInState);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<"active" | "inactive" | "all">("active");

  const navigate = useNavigate();
  const { setIsLoading } = useLoadingWrapper();

  const { data, isLoading, isFetching } = useGetEmployeeListQuery({
    user_type: user ? user.user_type : "",
    search: searchTerm,
  });

  const [deleteUser] = useDeleteUserMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  if (!user) return null;
  const rawList: any[] = data || employeeList || [];

  const activeCount = useMemo(
    () => rawList.filter((e: any) => Boolean(e.status)).length,
    [rawList],
  );

  const inactiveCount = useMemo(
    () => rawList.filter((e: any) => !Boolean(e.status)).length,
    [rawList],
  );

  const allCount = rawList.length;

  const filteredEmployeeList = useMemo(() => {
    if (statusTab === "active") {
      return rawList.filter((e: any) => Boolean(e.status));
    }
    if (statusTab === "inactive") {
      return rawList.filter((e: any) => !Boolean(e.status));
    }
    return rawList;
  }, [rawList, statusTab]);

  // Smooth sliding indicator for tabs
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [sliderStyle, setSliderStyle] = useState({ left: 4, width: 0, opacity: 0 });

  useEffect(() => {
    const updateSlider = () => {
      const activeEl = tabRefs.current[statusTab];
      const containerEl = tabsContainerRef.current;
      if (activeEl && containerEl) {
        const containerRect = containerEl.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        setSliderStyle({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
          opacity: 1,
        });
      }
    };

    updateSlider();
    const timer = setTimeout(updateSlider, 50);
    window.addEventListener("resize", updateSlider);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateSlider);
    };
  }, [statusTab, activeCount, inactiveCount, allCount]);

  // console.log("Employee List Data:", filteredEmployeeList);

  const deleteUserHandler = async (id: string, detailsId: string) => {
    try {
      setIsLoading(true);
      const response = await deleteUser({ id }).unwrap();
      if (response) {
        await deleteEmployee({ id: detailsId }).unwrap();
      }
      toast.success("Employee deleted successfully");
    } catch (error) {
      toast.error((error as any)?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== Columns ===================== */
  const columns: GridColDef[] = [
    {
      field: "employeeCode",
      headerName: "Employee Code",
      width: 130,
      renderCell: (params) => (
        <span className="text-xs font-medium text-gray-700">
          {params.row.empCode}
        </span>
      ),
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      width: 290,
      renderCell: (params) => (
        <EmployeeTableRow
          image={params.row.image}
          name={params.row.name}
          email={params.row.email}
        />
      ),
    },
    {
      field: "designation",
      headerName: "Designation",
      width: 190,
      renderCell: (params) => (
        <EmployeeDesignationRow title={params.row.designation} />
      ),
    },
    {
      field: "joiningDate",
      headerName: "Joining Date",
      width: 120,
      renderCell: (params: any) => (
        <span className="text-xs font-medium text-gray-700">
          {params.row.joiningDate
            ? dayjs(params.row.joiningDate).format("DD/MM/YYYY")
            : "___"}
        </span>
      ),
    },

    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => <EmployeeStatusRow status={params.row.status} />,
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <div className="flex w-full gap-3">
          {(user.user_type === "Admin" ||
            user.user_type === "Hr" ||
            user?.user_type === "Management") && (
            <button
              className="text-blue-600 text-sm font-medium hover:underline"
              onClick={() =>
                navigate(`/employees/${params.row.name}`, {
                  state: { employee: params.row },
                })
              }
            >
              <img src={Icons.EDIT} alt="" />
            </button>
          )}

          {user.user_type === "Admin" && (
            <button
              className="text-red-600 text-sm font-medium hover:underline"
              onClick={() =>
                deleteUserHandler(params.row.id, params.row.details_id)
              }
            >
              🗑 Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <CustomBox customClasses="p-6 w-full h-full overflow-scroll scrollbar-hide">
      {/* ===== Header Row: Title & Action Button ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-black text-2xl font-semibold">Employee</h2>

        {(user.user_type === "Admin" ||
          user.user_type === "Hr" ||
          user?.user_type === "Management") && (
          <CustomButton
            onClick={() => navigate("/employees/register")}
            customStyles="text-xs sm:text-sm font-semibold shadow-xs"
            label="Add New Employee"
            icon={<TbPlus size={20} />}
            buttonStyle="primary"
          />
        )}
      </div>

      {/* ===== Controls Toolbar: Smooth Tabs on Left + Search Box on Right ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-5">
        {/* Smooth Moving Segmented Tabs */}
        <div
          ref={tabsContainerRef}
          className="relative inline-flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 shadow-2xs select-none max-w-fit"
        >
          {/* Smooth Sliding Pill Indicator */}
          <div
            className="absolute top-1 bottom-1 bg-white rounded-xl shadow-xs border border-slate-200/80 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
            style={{
              left: `${sliderStyle.left}px`,
              width: `${sliderStyle.width}px`,
              opacity: sliderStyle.opacity,
            }}
          />

          {/* Active Tab */}
          <button
            ref={(el) => { tabRefs.current["active"] = el; }}
            type="button"
            onClick={() => setStatusTab("active")}
            className={`group relative z-10 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-2 outline-none focus:outline-none focus:ring-0 border-0 ${
              statusTab === "active" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-200 ${
                statusTab === "active"
                  ? "bg-emerald-50 text-emerald-600 shadow-2xs"
                  : "bg-slate-200/60 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600"
              }`}
            >
              <UserCheck size={13} className="stroke-[2.5]" />
            </div>
            <span className={statusTab === "active" ? "font-bold text-slate-900" : "font-medium"}>
              Active
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors duration-200 ${
                statusTab === "active"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  : "bg-slate-200/70 text-slate-600 group-hover:bg-slate-200"
              }`}
            >
              {activeCount}
            </span>
          </button>

          {/* Inactive Tab */}
          <button
            ref={(el) => { tabRefs.current["inactive"] = el; }}
            type="button"
            onClick={() => setStatusTab("inactive")}
            className={`group relative z-10 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-2 outline-none focus:outline-none focus:ring-0 border-0 ${
              statusTab === "inactive" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-200 ${
                statusTab === "inactive"
                  ? "bg-rose-50 text-rose-600 shadow-2xs"
                  : "bg-slate-200/60 text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600"
              }`}
            >
              <UserX size={13} className="stroke-[2.5]" />
            </div>
            <span className={statusTab === "inactive" ? "font-bold text-slate-900" : "font-medium"}>
              Inactive
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors duration-200 ${
                statusTab === "inactive"
                  ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                  : "bg-slate-200/70 text-slate-600 group-hover:bg-slate-200"
              }`}
            >
              {inactiveCount}
            </span>
          </button>

          {/* All Tab */}
          <button
            ref={(el) => { tabRefs.current["all"] = el; }}
            type="button"
            onClick={() => setStatusTab("all")}
            className={`group relative z-10 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-2 outline-none focus:outline-none focus:ring-0 border-0 ${
              statusTab === "all" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-200 ${
                statusTab === "all"
                  ? "bg-orange-50 text-[#ff7300] shadow-2xs"
                  : "bg-slate-200/60 text-slate-400 group-hover:bg-orange-50 group-hover:text-[#ff7300]"
              }`}
            >
              <Users size={13} className="stroke-[2.5]" />
            </div>
            <span className={statusTab === "all" ? "font-bold text-slate-900" : "font-medium"}>
              All
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors duration-200 ${
                statusTab === "all"
                  ? "bg-orange-50 text-[#ff7300] border border-orange-200/80"
                  : "bg-slate-200/70 text-slate-600 group-hover:bg-slate-200"
              }`}
            >
              {allCount}
            </span>
          </button>
        </div>

        {/* Search Input Bar (Aligned with tabs on the right) */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by employee name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200/90 bg-white
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         placeholder:text-slate-400 text-slate-800 shadow-2xs transition-all"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <ImSearch size={14} className="text-primary" />
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md cursor-pointer"
            >
              <TbX size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="h-full mt-4">
        <CustomDataTable
          columns={columns}
          rows={filteredEmployeeList}
          isLoading={isLoading || isFetching}
          withPagination={false}
          isDataEmpty={filteredEmployeeList.length === 0}
          emptyViewTitle={
            statusTab === "active"
              ? "No Active Employees Found"
              : statusTab === "inactive"
              ? "No Inactive Employees Found"
              : "No Employees Found"
          }
          emptyViewSubTitle={
            statusTab === "inactive"
              ? "There are currently no inactive employees"
              : "Please add an employee to the system"
          }
        />
      </div>
    </CustomBox>
  );
};

export default EmployeeList;

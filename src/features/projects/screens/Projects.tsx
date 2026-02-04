/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  X,
  Edit3,
  Plus,
  CheckCircle,
  Briefcase,
  Layout,
} from "lucide-react";
import {
  useAddProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from "../projectsApi";
import type { ProjectPayload } from "../projects.types";
import { useSelector } from "react-redux";
import { userInState } from "../../auth/authSlice";
import { employeeListInState } from "../../employee/employeeSlice";

const Projects = () => {
  // ===== API =====
  const user = useSelector(userInState);
  const employeeList = useSelector(employeeListInState);
  const { data: assignments = [], isLoading } = useGetProjectsQuery();
  const [addProject] = useAddProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  // ===== LOCAL UI STATE =====
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    selectedEmployees: [] as string[],
    project: "",
  });

  if (!user) return null;
  const filteredEmployeeList = employeeList?.filter(
    (employee) => employee.role !== user?.user_type.toLocaleLowerCase(),
  );

  // const employeeList = [
  //   "Sumit Thakur",
  //   "Amit singh",
  //   "Fiza",
  //   "Pooja Sharma",
  //   "Arun",
  // ];

  // ===== HANDLERS =====

  const handleEmployeeSelect = (name: string) => {
    if (!formData.selectedEmployees.includes(name)) {
      setFormData({
        ...formData,
        selectedEmployees: [...formData.selectedEmployees, name],
      });
    }
  };

  const removeEmployee = (name: string) => {
    setFormData({
      ...formData,
      selectedEmployees: formData.selectedEmployees.filter((e) => e !== name),
    });
  };

  const handleEdit = (item: any) => {
    setIsEditing(item.id);
    setFormData({
      selectedEmployees: item.employees,
      project: item.project,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ selectedEmployees: [], project: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project || formData.selectedEmployees.length === 0) return;

    const payload: ProjectPayload = {
      title: formData.project,
      users_permissions_users: formData.selectedEmployees.map((emp) => emp),
    };

    try {
      if (isEditing) {
        await updateProject({
          id: isEditing,
          data: payload,
        }).unwrap();
      } else {
        await addProject(payload).unwrap();
      }

      resetForm();
    } catch (err) {
      console.error("Project save failed", err);
    }
  };

  // ===== UI =====
  return (
    <div className="p-2 bg-background min-h-screen plus-jakarta-sans text-black">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Project Management</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Assign Project Form */}
        <div
          className={`w-full lg:w-80 bg-white p-6 rounded-3xl shadow-sm border transition-all duration-300 shrink-0 ${
            isEditing ? "border-primary" : "border-black-20"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl ${
                  isEditing
                    ? "bg-black text-white"
                    : "bg-primary-20 text-primary"
                }`}
              >
                <Briefcase size={20} strokeWidth={2.5} />
              </div>
              <h2 className="font-bold text-lg text-black-800">
                {isEditing ? "Update" : "Assign"}
              </h2>
            </div>

            {isEditing && (
              <button
                onClick={resetForm}
                className="text-[10px] font-bold text-red uppercase tracking-tighter hover:underline"
              >
                Cancel
              </button>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Employees */}
            <div>
              <label className="text-[10px] font-black text-black-50 uppercase tracking-widest ml-1">
                Team Members
              </label>
              <select
                onChange={(e) => handleEmployeeSelect(e.target.value)}
                value=""
                className="w-full mt-1 p-4 bg-primary-20/20 border border-primary-20 rounded-2xl text-sm focus:border-primary outline-none transition-all"
              >
                <option value="" disabled>
                  Select Team...
                </option>
                {filteredEmployeeList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 mt-3 max-h-20 overflow-y-auto scrollbar-hide">
                {formData.selectedEmployees.map((emp) => (
                  <span
                    key={emp}
                    className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase"
                  >
                    {emp}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={() => removeEmployee(emp)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Project name */}
            <div>
              <label className="text-[10px] font-black text-black-50 uppercase tracking-widest ml-1">
                Project Name
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
                }
                placeholder="Project title..."
                className="w-full mt-1 p-4 bg-white border border-black-20 rounded-2xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Icon preview */}
            <div className="flex items-center gap-3 p-3 bg-background rounded-2xl border border-dashed border-black-20">
              <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                <Layout size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase text-black-50">
                Project Icon Assigned
              </span>
            </div>

            <button
              type="submit"
              className={`w-full py-4 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isEditing ? "bg-black" : "bg-primary"
              }`}
            >
              {isEditing ? <CheckCircle size={18} /> : <Plus size={18} />}
              {isEditing ? "Update Now" : "Assign Now"}
            </button>
          </form>
        </div>

        {/* Projects List */}
        <div className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-black-20 overflow-hidden">
          <div className="p-6 border-b border-black-20 flex justify-between items-center gap-4">
            <h2 className="font-bold text-black-800 uppercase text-sm tracking-widest">
              Active Projects
            </h2>

            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-2.5 text-black-20"
                size={16}
              />
              <input
                type="text"
                placeholder="Find project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-black-20 rounded-xl text-xs focus:border-primary outline-none w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-90 scrollbar-hide">
            <table className="w-full">
              <tbody className="divide-y divide-black-20">
                {isLoading && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-xs font-bold uppercase text-black-50"
                    >
                      Loading projects...
                    </td>
                  </tr>
                )}

                {assignments
                  .filter((a: any) =>
                    a.project.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-6">
                        <div className="flex -space-x-3">
                          {item.employees.map((emp: string, i: number) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black"
                            >
                              {emp[0]}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <p className="text-sm font-black uppercase">
                          {item.project}
                        </p>
                      </td>

                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEdit(item)}>
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => deleteProject(item.id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;

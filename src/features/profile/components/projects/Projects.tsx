/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Search, Trash2, X, Edit3, Plus, CheckCircle, Briefcase, Layout } from 'lucide-react';

const Projects = () => {
  const [assignments, setAssignments] = useState([
    { id: 1, employees: ["Sumit Thakur", "Amit singh"], project: "E-commerce App" },
    { id: 2, employees: ["Fiza"], project: "Admin Dashboard UI" },
    { id: 3, employees: ["Arun"], project: "Mobile Banking App" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    selectedEmployees: [] as string[],
    project: "",
  });

  const employeeList = ["Sumit Thakur", "Amit singh", "Fiza", "Pooja Sharma", "Arun"];

  const handleEmployeeSelect = (name: string) => {
    if (!formData.selectedEmployees.includes(name)) {
      setFormData({ ...formData, selectedEmployees: [...formData.selectedEmployees, name] });
    }
  };

  const removeEmployee = (name: string) => {
    setFormData({ ...formData, selectedEmployees: formData.selectedEmployees.filter(e => e !== name) });
  };

  const handleEdit = (item: any) => {
    setIsEditing(item.id);
    setFormData({
      selectedEmployees: item.employees,
      project: item.project,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ selectedEmployees: [], project: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedEmployees.length === 0 || !formData.project) return;

    if (isEditing) {
      setAssignments(assignments.map(a => 
        a.id === isEditing 
        ? { ...a, employees: formData.selectedEmployees, project: formData.project }
        : a
      ));
    } else {
      const newEntry = {
        id: Date.now(),
        employees: formData.selectedEmployees,
        project: formData.project,
      };
      setAssignments([newEntry, ...assignments]);
    }
    resetForm();
  };

  return (
    <div className="p-2 bg-background min-h-screen plus-jakarta-sans text-black">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Project Management</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Assign Project Form */}
        <div className={`w-full lg:w-80 bg-white p-6 rounded-3xl shadow-sm border transition-all duration-300 shrink-0 ${isEditing ? 'border-primary' : 'border-black-20'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${isEditing ? 'bg-black text-white' : 'bg-primary-20 text-primary'}`}>
                <Briefcase size={20} strokeWidth={2.5} />
              </div>
              <h2 className="font-bold text-lg text-black-800">{isEditing ? 'Update' : 'Assign'}</h2>
            </div>
            {isEditing && (
              <button onClick={resetForm} className="text-[10px] font-bold text-red uppercase tracking-tighter hover:underline">
                Cancel
              </button>
            )}
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-[10px] font-black text-black-50 uppercase tracking-widest ml-1">Team Members</label>
              <select 
                onChange={(e) => handleEmployeeSelect(e.target.value)}
                value=""
                className="w-full mt-1 p-4 bg-primary-20/20 border border-primary-20 rounded-2xl text-sm focus:border-primary outline-none transition-all"
              >
                <option value="" disabled>Select Team...</option>
                {employeeList.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>

              <div className="flex flex-wrap gap-2 mt-3 max-h-20 overflow-y-auto scrollbar-hide">
                {formData.selectedEmployees.map(emp => (
                  <span key={emp} className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase">
                    {emp}
                    <X size={12} className="cursor-pointer" onClick={() => removeEmployee(emp)} />
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-black-50 uppercase tracking-widest ml-1">Project Name</label>
              <input 
                type="text" 
                value={formData.project}
                onChange={(e) => setFormData({...formData, project: e.target.value})}
                placeholder="Project title..." 
                className="w-full mt-1 p-4 bg-white border border-black-20 rounded-2xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
              />
            </div>

            {/* Project Icon Preview Area */}
            <div className="flex items-center gap-3 p-3 bg-background rounded-2xl border border-dashed border-black-20">
                <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                    <Layout size={18} />
                </div>
                <span className="text-[10px] font-bold uppercase text-black-50">Project Icon Assigned</span>
            </div>

            <button type="submit" className={`w-full py-4 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isEditing ? 'bg-black' : 'bg-primary'}`}>
              {isEditing ? <CheckCircle size={18} /> : <Plus size={18} />}
              {isEditing ? 'Update Now' : 'Assign Now'}
            </button>
          </form>
        </div>

        {/* Active Projects List - 3 Rows and Scroll */}
        <div className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-black-20 overflow-hidden">
          <div className="p-6 border-b border-black-20 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
            <h2 className="font-bold text-black-800 uppercase text-sm tracking-widest">Active Projects</h2>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-2.5 text-black-20" size={16} />
              <input 
                type="text" 
                placeholder="Find project..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-black-20 rounded-xl text-xs focus:border-primary outline-none w-full sm:w-64"
              />
            </div>
          </div>

          {/* Fixed Height Container for 3 Projects approx 360px */}
          <div className="overflow-x-auto max-h-90 overflow-y-auto custom-scrollbar scrollbar-hide">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-background sticky top-0 z-10">
                <tr className="text-[10px] text-black-50 uppercase font-black tracking-widest">
                  <th className="px-6 py-4 text-left">Team Stack</th>
                  <th className="px-6 py-4 text-left">Project Details</th>
                  <th className="px-6 py-4 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black-20">
                {assignments.filter(a => a.project.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <tr key={item.id} className="hover:bg-primary-20/5 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center -space-x-3">
                        {item.employees.map((emp, i) => (
                          <div key={i} title={emp} className="w-10 h-10 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                            {emp[0]}
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] font-bold text-black-50 mt-2 uppercase">{item.employees.join(" • ")}</p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-black text-black-800 uppercase">{item.project}</p>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleEdit(item)} className="p-2 text-black-50 hover:text-primary transition-all rounded-xl hover:bg-primary-20/20">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => setAssignments(assignments.filter(a => a.id !== item.id))} className="p-2 text-black-20 hover:text-red transition-all rounded-xl hover:bg-lightRed">
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
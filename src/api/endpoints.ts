const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  // Authentication
  login: `${baseUrl}/api/auth/local`,
  register: `${baseUrl}/api/auth/local/register`,
  userDetails: (id: number | string) => `${baseUrl}/api/user/${id}`,

  // Employee
  info: `${baseUrl}/api/emp-details/?populate=*&sort=id`,  
  addinfo: `${baseUrl}/api/emp-details/?populate=*`,  
  infoEdit: (id: number | string) =>
    `${baseUrl}/api/emp-details/${id}/?populate=*`,  
  employeeDetails: `${baseUrl}/api/emp-details`,  
  updateEmployeeDetails: (id: string | number) =>
    `${baseUrl}/api/emp-details/${id}`, 
  employeeList: (user_type: string) => `${baseUrl}/api/users/${user_type}`,  
  deleteUser: (id: string | number) => `${baseUrl}/api/users/${id}`, 
  updateUser: (id: string | number) => `${baseUrl}/api/users/${id}`, 
  deleteEmployee: (id: string | number) => `${baseUrl}/api/emp-details/${id}`,  

  // File Upload
  uploadFiles: `${baseUrl}/api/upload`,  
  uploadImg: `${baseUrl}/api/upload`,  
  getuploadImg: (id: number | string) => `${baseUrl}/api/upload/files/${id}`,
  UPLOAD_IMAGE: `${baseUrl}/api/upload`,

  // Attendance
  getAttendanceLegacy: `${baseUrl}/api/daily-attendances/?populate=*&sort=id`, 
  postAttendance: `${baseUrl}/api/daily-attendances`,
  editAttendance: (id: number | string) =>
    `${baseUrl}/api/daily-attendances/${id}/?populate=*`,
  deleteAttendance: (id: number | string) =>
    `${baseUrl}/api/daily-attendances/${id}`,
  filterDateRange: (startDate: string, endDate: string) =>
    `${baseUrl}/api/daily-attendances/?populate=*&sort=id&filters[Date][$gte]=${startDate}&filters[Date][$lte]=${endDate}`,

  getTodayAttendance: (id: number | string) =>
    `${baseUrl}/api/daily-attendance/today/${id}`,
  checkIn: `${baseUrl}/api/daily-attendance/check-in`,
  checkOut: `${baseUrl}/api/daily-attendance/check-out`,
  getAttendance: (
    id: number | string,
    startDate?: string,
    endDate?: string,
  ) => {
    let url = `${baseUrl}/api/daily-attendance/${id}`;
    if (startDate) {
      url += `?fromDate=${startDate}&toDate=${endDate}`;
    }
    return url;
  },
  getAllAttendance: (
    page: number,
    pageSize: number,
    startDate?: string,
    endDate?: string,
    search?: string,
  ) => {
    let url = `${baseUrl}/api/daily-attendance/all?page=${page}&pageSize=${pageSize}&sort=id:DESC`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return url;
  },
  updateAttendance: (id: number | string) =>
    `${baseUrl}/api/daily-attendances/${id}/manual-update`,

  // Leaves
  updateLeave: (id: number | string) => `${baseUrl}/api/leave-statuses/${id}`,
  getUserLeavesLegacy: (id: number | string) =>
    `${baseUrl}/api/users/${id}/?populate=*`, // apiendpoint.getUserLeaves
  getLeavesList: (page?: number, search?: string) => {
    let url = `${baseUrl}/api/leave-statuses?populate=*&pagination[page]=${page ?? 1}&pagination[pageSize]=10`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return url;
  },
  applyLeave: `${baseUrl}/api/leave-statuses`,
  getUserLeaves: `${baseUrl}/api/leave-statuses/my-leaves`,
  getUserALlLeaves: (page: number, username?: string) => {
    let url = `${baseUrl}/api/leave-statuses/my-leaves?page=${page}&pageSize=10`;
    if (username) {
      url += `&username=${encodeURIComponent(username)}`;
    }
    return url;
  },
  getLeaves: `${baseUrl}/api/leave-statuses`,
  deleteLeave: (id: number | string) => `${baseUrl}/api/leave-statuses/${id}`,
  getLeaveRequests: `${baseUrl}/api/leave-statuses?filters[status][$eq]=pending&populate[user][populate][user_detial][populate]=Photo&sort=id:desc`,
  approveLeave: (id: number | string) =>
    `${baseUrl}/api/leave-status/${id}/approve`,
  rejectLeave: (id: number | string) =>
    `${baseUrl}/api/leave-status/${id}/reject`,
  hrApproveleave: (id: number | string) =>
    `${baseUrl}/api/leave-statuses/${id}/hr-update-and-approve-leave`,
  updateUserLeaveBalance: (id: string | number) =>
    `${baseUrl}/api/user/${id}/leave-balance`,
  getEmployeeLeaveBalance: (id: string | number) =>
    `${baseUrl}/api/user/${id}/leave-balance`,
  getLeaveBalance: `${baseUrl}/api/leave-balance/me`,
  allLeaveBalance: `${baseUrl}/api/leave-balance/all`,

  updateLeaveBalance: (id: number | string) =>
    `${baseUrl}/api/leave-balances/${id}`,

  // Holidays
  getHolidays: `${baseUrl}/api/holiday-lists`,
  getHolidayById: (id: number | string) => `${baseUrl}/api/holiday-lists/${id}`,
  deleteHoliday: (id: number | string) => `${baseUrl}/api/holiday-lists/${id}`,
  postHoliday: `${baseUrl}/api/holiday-lists`,
  patchHoliday: (id: number | string) => `${baseUrl}/api/holiday-lists/${id}`,

  // Blogs
  getBlogsList: (page?: number) =>
    `${baseUrl}/api/add-blogs?populate=*&sort=id:desc&pagination[page]=${page ?? 1}&pagination[pageSize]=10`,
  postBlogs: `${baseUrl}/api/add-blogs`,
  editBlogs: (id: number | string) =>
    `${baseUrl}/api/add-blogs/${id}?populate=*`,
  deleteBlogs: (id: number | string) => `${baseUrl}/api/add-blogs/${id}`,

  // Documents
  getDocuments: `${baseUrl}/api/documents?populate=*&sort=id`,
  postDocuments: `${baseUrl}/api/documents?populate=*`,
  editDocuments: (id: number | string) =>
    `${baseUrl}/api/documents/${id}/?populate=*`,
  deleteDocuments: (id: number | string) => `${baseUrl}/api/documents/${id}`,
  getDocumentsByUser: (id: number | string) =>
    `${baseUrl}/api/documents?populate=*&sort=id&filters[user][id][$eq]=${id}`,

  // Announcements
  getAnnouncements: `${baseUrl}/api/announcements?sort=Date:desc`,
  getAnnouncementById: (id: number | string) =>
    `${baseUrl}/api/announcements/${id}`,

  // Stats
  getDashboardStats: `${baseUrl}/api/dashboard/stats`,
  getPresentEmployees: `${baseUrl}/api/dashboard/stats/present`,
  getAbsentEmployees: `${baseUrl}/api/dashboard/stats/absent`, 
  getLeaveEmployees: `${baseUrl}/api/dashboard/stats/leave`,

  // Projects
  getProjects: `${baseUrl}/api/projects?populate=*`,
  postProjects: `${baseUrl}/api/projects`,
  updateProject: (id: number | string) => `${baseUrl}/api/projects/${id}`,
  deleteProject: (id: number | string) => `${baseUrl}/api/projects/${id}`,

  // Time Logs
  getTimeLogs: (startDate: string, endDate: string, search?: string) => {
    let url = `${baseUrl}/api/work-logs/userWorkLogs?startDate=${startDate}&endDate=${endDate}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return url;
  },
};

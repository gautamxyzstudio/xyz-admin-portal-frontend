const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  login: `${baseUrl}/api/auth/local`,
  uploadFiles: `${baseUrl}/api/upload`,
  register: `${baseUrl}/api/auth/local/register`,
  userDetails: (id: number) => `${baseUrl}/api/user/${id}`,
  employeeDetails: `${baseUrl}/api/emp-details`,
  updateEmployeeDetails: (id: string) => `${baseUrl}/api/emp-details/${id}`,
  updateUserLeaveBalance: (id: string) =>
    `${baseUrl}/api/user/${id}/leave-balance`,
  getEmployeeLeaveBalance: (id: string) =>
    `${baseUrl}/api/user/${id}/leave-balance`,
  getLeaveBalance: `${baseUrl}/api/leave-balance/me`,
  employeeList: (user_type: string) => `${baseUrl}/api/users/${user_type}`,
  deleteUser: (id: string) => `${baseUrl}/api/users/${id}`,
  updateUser: (id: string) => `${baseUrl}/api/users/${id}`,
  deleteEmployee: (id: string) => `${baseUrl}/api/emp-details/${id}`,
  getTodayAttendance: (id: number) =>
    `${baseUrl}/api/daily-attendance/today/${id}`,
  checkIn: `${baseUrl}/api/daily-attendance/check-in`,
  checkOut: `${baseUrl}/api/daily-attendance/check-out`,
  getAttendance: (id: number, startDate?: string, endDate?: string) => {
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
    search?: string
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
  getLeavesList: (
    page?: number,
    search?: string,
  ) => {
    console.log("=-=-=-=-=-=-=-");

    let url = `${baseUrl}/api/leave-statuses?populate=*&pagination[page]=${
      page ?? 1
    }&pagination[pageSize]=10`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return url;
  },
  updateAttendance: `${baseUrl}/api/daily-attendance/update-attendance`,
  applyLeave: `${baseUrl}/api/leave-statuses`,
  getUserLeaves: `${baseUrl}/api/leave-statuses/my-leaves`,
  getUserALlLeaves: (
    page: number,
    search?: string
  ) => {
    let url = `${baseUrl}/api/leave-statuses/my-leaves?page=${page}&pageSize=10`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    return url;
  },
  getLeaves: `${baseUrl}/api/leave-statuses`,
  deleteLeave: (id: number) => `${baseUrl}/api/leave-statuses/${id}`,
  updateLeave: (id: number) => `${baseUrl}/api/leave-statuses/${id}`,
  getLeaveRequests: `${baseUrl}/api/leave-statuses?filters[status][$eq]=pending&populate[user][populate][user_detial][populate]=Photo&sort=id:desc`,
  approveLeave: (id: number) => `${baseUrl}/api/leave-status/${id}/approve`,
  rejectLeave: (id: number) => `${baseUrl}/api/leave-status/${id}/reject`,
  hrApproveleave:(id:number) =>`${baseUrl}/api/leave-statuses/${id}/hr-update-and-approve-leave`
};

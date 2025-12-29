// @ts-ignore
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const apiendpoint = {
  login: `${baseUrl}/api/auth/local`,

  //Endpoint for Employee
  info: `${baseUrl}/api/emp-details/?populate=*&sort=id`,
  addinfo: `${baseUrl}/api/emp-details/?populate=*`,
  infoEdit: (id: number) => `${baseUrl}/api/emp-details/${id}/?populate=*`,

  // Upload image
  uploadImg: `${baseUrl}/api/upload`,
  getuploadImg: (id: number) => `${baseUrl}/api/upload/files/${id}`,

  //Endpoint for Attendance
  getAttendance: `${baseUrl}/api/daily-attendances/?populate=*&sort=id`,
  postAttendance: `${baseUrl}/api/daily-attendances`,
  editAttendance: (id: number) =>
    `${baseUrl}/api/daily-attendances/${id}/?populate=*`,
  deleteAttendance: (id: number) => `${baseUrl}/api/daily-attendances/${id}`,
  filterDateRange: (startDate: string, endDate: string) =>
    `${baseUrl}/api/daily-attendances/?populate=*&sort=id&filters[Date][$gte]=${startDate}&filters[Date][$lte]=${endDate}`,

  //Endpoint for Holidays
  getHolidaysList: `${baseUrl}/api/holiday-lists?sort=id`,
  postHolidays: `${baseUrl}/api/holiday-lists`,

  // Blogs Endpoint
  getBlogsList: `${baseUrl}/api/add-blogs?populate=*&sort=id:desc`,
  postBlogs: `${baseUrl}/api/add-blogs`,
  editBlogs: (id: number) => `${baseUrl}/api/add-blogs/${id}/?populate=*`,
  deleteBlogs: (id: number) => `${baseUrl}/api/add-blogs/${id}`,

  //Endpoint for Leaves
  updateLeave: (id: number) => `${baseUrl}/api/leave-statuses/${id}`,
  getUserLeaves: (id: number) => `${baseUrl}/api/users/${id}/?populate=*`,
  getHolidays: `${baseUrl}/api/holiday-lists`,
  deleteHoliday: (id: number) => `${baseUrl}/api/holiday-lists/${id}`,
  postHoliday: `${baseUrl}/api/holiday-lists`,
  patchHoliday: (id: number) => `${baseUrl}/api/holiday-lists/${id}`,
  getDocuments: `${baseUrl}/api/documents?populate=*&sort=id`,
  postDocuments: `${baseUrl}/api/documents?populate=*`,
  editDocuments: (id: number) => `${baseUrl}/api/documents/${id}/?populate=*`,
  deleteDocuments: (id: number) => `${baseUrl}/api/documents/${id}`,
  getDocumentsByUser: (id: number) =>
    `${baseUrl}/api/documents?populate=*&sort=id&filters[user][id][$eq]=${id}`,
  UPLOAD_IMAGE: `${baseUrl}/api/upload`,
};

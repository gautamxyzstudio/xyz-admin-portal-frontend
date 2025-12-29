export type AddEmployeeFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  joiningDate: string;
  avatar: string;
  status: 'active' | 'deactive';
  leaveBalance: string;

  designation: string;
  employeeCode: string;
  role: string;
};

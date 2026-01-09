export interface IEmployeeSliceInitialState {
  employeeList: IEmployee[];
}

export type IRegisterUserArgs = {
  username: string;
  email: string;
  password: string;
  role: string;
  user_type: string;
  leave_balance: number;
  daily_attendances: string[];
  unpaid_leave_balance: number;
  date_of_birth: string;
  joining_date: string;
};

export type IRegisterUserResponse = {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    user_type: "Admin" | "Employee" | "Hr" | "Seo";
    createdAt: string;
    updatedAt: string;
    date_of_birth: string;
    joining_date: string;
  };
};

export type IAddEmployeeArgs = {
  name: string;
  designation: string;
  empCode: string;
  email: string;
  phoneNumber: string;
  joiningDate: string;
  Photo: string[];
  status: boolean;
  user_detail: string;
};

export type IEditEmployeeArgs = {
  name: string;
  designation: string;
  empCode: string;
  joiningDate: string;
  phoneNumber: string;
  Photo: string[];
  leave_balance?: number;
  status: boolean;
};

export interface IEmployee {
  id: number;
  email: string;
  details_id: number;
  name: string;
  designation: string;
  empCode: string;
  phoneNumber: string;
  joiningDate: string;
  role: string;
  status: boolean;
  leave_balance: number;
  unpaid_leave_balance: number;
  image: string;
  imageId: number;
  dateOfBirth:string
}

export interface IEmployeeFromResponse {
  id: number;
  username: string;
  email: string;
  provider: string;
  password: string;
  resetPasswordToken: string;
  confirmationToken: string;
  confirmed: boolean;
  blocked: boolean;
  user_type: string;
  createdAt: string;
  updatedAt: string;
  leave_balance: number;
  unpaid_leave_balance: number;
  role: {
    id: number;
    name: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
  user_detial: {
    [x: string]: string;
    id: number;
    name: string;
    designation: string;
    empCode: string;
    phoneNumber: string;
    joiningDate: string;
    status: boolean;
    leave_balance: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    Photo: {
      id: number;
      name: string;
      alternativeText: string;
      caption: string;
      width: number;
      height: number;
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      previewUrl: string;
      provider: string;
      provider_metadata: string;
      folderPath: string;
    }[];
  };
}

export type IUpdateLeaveBalanceArgs = {
  leave_balance: number;
  unpaid_leave_balance: number;
};

export type ILeaveBalance = {
  data: {
    year: number;
    el_balance: number;
    cl_balance: number;
    sl_balance: number;
    unpaid_balance: number;
  };
};

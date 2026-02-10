export interface IEmployeeSliceInitialState {
  employeeList: IEmployee[];
}

export type IRegisterUserArgs = {
  username: string;
  email: string;
  password: string;
  role: string;
  user_type: string;
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
    user_type: "Admin" | "Employee" | "Hr" | "Management";
    createdAt: string;
    updatedAt: string;
  };
};

export type IAddEmployeeArgs = {
  name: string;
  designation: string;
  empCode: string;
  email: string;
  phoneNumber: string;
  Photo: string[];
  status: boolean;
  user_detail: string;
  date_of_birth: string;
  active_blogs: boolean;
  joinig_date: string;
};

export type IEditEmployeeArgs = {
  name?: string;
  designation?: string;
  empCode?: string;
  phoneNumber?: string;
  Photo?: string[];
  status?: boolean;
  coverImage?: string;
  date_of_birth?: string;
  active_blogs?: boolean;
  joinig_date?: string;
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
  image: string;
  imageId: number;
  active_blogs: boolean;
  dateOfBirth: string;
  coverImage: string;
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
  checkout_email_enabled: boolean;
  role: {
    id: number;
    name: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
  user_detial: {
    id: number;
    name: string;
    designation: string;
    empCode: string;
    phoneNumber: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    coverImage: string;
    date_of_birth: string;
    active_blogs: boolean;
    joinig_date: string;
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
  year: number;
  el_balance: number;
  cl_balance: number;
  sl_balance: number;
  unpaid_balance: number;
};

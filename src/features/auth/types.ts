export interface IAuthState {
  user: IUserBasic | null;
  userDetails: IUserAdvance | null;
}

export interface ILoginRequest {
  identifier: string;
  password: string;
}

export interface ILoginResponse {
  jwt: string;
  user: IUserBasic;
}

export interface IUserBasic {
  id: number;
  email: string;
  user_type: 'Admin' | 'Employee' | 'Hr' | 'Seo' | 'Manager';
  leave_balance: number;
  unpaid_leave_balance: number;
  token: string;
}

export interface IUserAdvance {
  details_id: number;
  email: string;
  role: string;
  name: string;
  designation: string;
  joining_date: string;
  leave_balance: number;
  unpaid_leave_balance: number;
  status: string;
  phoneNumber: string;
  empCode: string;
  photo: string;
}

export interface IUserDetailsResponse {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  user_type: string;
  unpaid_leave_balance: number;
  leave_balance: number;
  createdAt: string;
  updatedAt: string;
  role: {
    name: string;
  };

  user_detial: {
    id: number;
    name: string;
    designation: string;
    empCode: string;

    phoneNumber: string;
    joiningDate: string;
    status: string;

    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    Photo: [
      {
        url: string;
      }
    ];
  };
}

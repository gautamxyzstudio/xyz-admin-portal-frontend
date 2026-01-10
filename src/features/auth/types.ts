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
  user_type: "Admin" | "Employee" | "Hr" | "Manager";
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
  joinig_date: string | null;
  date_of_birth: string | null;
  status: boolean | null;
  phoneNumber: string;
  empCode: string;
  photo: string | null;
  active_blogs: boolean | null;
  coverImage: string | null;
}

export interface IUserDetailsResponse {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  user_type: string;
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
    joinig_date: string | null;
    date_of_birth: string | null;
    status: boolean;
    active_blogs: boolean | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    Photo: [
      {
        url: string;
      }
    ];
    coverImage: {
      url: string;
    };
  };
}

export type IApplyLeaveArgs = {
  data: {
    start_date: string;
    end_date: string;
    description: string;
    status: "pending";
    decline_reason: string;
    title: string;
    leave_category: "short_leave" | "half_day" | "full_day";
    leave_type: "CL" | "EL" | "SL" | "un-paid" | null;
    half_day_type: "first_half" | "second_half" | null;
    start_time?: string | null;
    user: string | number;
  };
};

export interface ILeave {
  start_date: string;
  id?: number;
  end_date: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  description: string;
  decline_reason: string;
  title: string;
  start_time?: string | null;
  days?: string;
  leave_category: "short_leave" | "half_day" | "full_day";
  half_day_type: "first_half" | "second_half";
  leave_type?: "CL" | "EL" | "SL" | "un-paid";
  user: {
    data: {
      id: number;
      attributes: {
        username: string;
        email: string;
        provider: "local";
        confirmed: boolean;
        blocked: boolean;
        user_type: "Employee";
        createdAt: string;
        updatedAt: string;
        leave_balance: number | null;
        unpaid_leave_balance: number | null;
        user_detial: {
          data: {
            attributes: {
              Photo: { data: { attributes: { url: string } }[] };
            };
          };
        };
      };
    };
  };
}
export interface ILeaveDetailsResponse {
  start_date: string;
  id?: number;
  end_date: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  description: string;
  decline_reason: string;
  title: string;
  start_time?: string | null;
  days?: string;
  leave_category: "short_leave" | "half_day" | "full_day";
  half_day_type: "first_half" | "second_half" | null;
  leave_type: "CL" | "EL" | "SL" | "un-paid" | null;
  leave_days: ILeaveDay[]
}

export interface ILeaveResponse {
  data: {
    id: number;
    attributes: {
      start_date: string;
      end_date: string;
      status: "pending" | "approved" | "declined";
      createdAt: string;
      description: string;
      decline_reason: string;
      start_time?: string | null;
      title: string;
      leave_category: "short_leave" | "half_day" | "full_day";
      half_day_type: "first_half" | "second_half";
      leave_type: "CL" | "EL" | "SL" | "un-paid";
      user: {
        data: {
          id: number;
          attributes: {
            username: string;
            email: string;
            provider: "local";
            confirmed: true;
            blocked: boolean;
            user_type: "Employee";
            createdAt: string;
            updatedAt: string;
            leave_balance: number | null;
            unpaid_leave_balance: number | null;
          };
        };
      };
    };
  }[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface IUpdateLeaveArgs {
  start_date?: string;
  end_date?: string;
  description?: string;
  status?: "pending" | "approved" | "declined";
  decline_reason?: string;
  title: string;
  user: string | number;
  leave_category?: "short_leave" | "half_day" | "full_day";
  start_time?: string | null;
  half_day_type: "first_half" | "second_half";
  leave_type: "CL" | "EL" | "SL" | "un-paid";
}

export interface IApproveLeaveResponse {
  message: string;
  data: {
    id: number;
    start_date: string;
    end_date: string;
    status: "pending" | "approved" | "declined";
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    description: string;
    decline_reason: string;
    title: string;
    leave_category: "short_leave" | "half_day" | "full_day";
    half_day_type: "first_half" | "second_half" | null;
    leave_type: "CL" | "EL" | "SL" | "un-paid" | null;
    start_time: string | null;
  };
  leaveDaysDeducted: number;
}

// eaveRequest
export interface ILeaveRequest {
  id: number;
  title: string;
  description: string;
  status: "pending" | "approved" | "declined";
  leave_type: "CL" | "EL" | "SL" | "un-paid";
  leave_category: "full_day" | "half_day" | "short_leave";
  days: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  start_time: string | null;
  half_day_type: string | null;
  decline_reason: string | null;
  leave_days: ILeaveDay[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  user: IUserRelation;
}
export interface ILeaveDay {
  day: string; // "Tue"
  date: string; // "2026-01-13"
  duration: number; // 1
  editable: boolean;
  leave_type: string; // "CL"
}
export interface IUserRelation {
  data: IUserData;
}

export interface IUserData {
  id: number;
  attributes: IUserAttributes;
}
export interface IUserAttributes {
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  user_type: string;
  createdAt: string;
  updatedAt: string;
  user_detial: IUserDetailRelation;
}
export interface IUserDetailRelation {
  data: IUserDetailData;
}

export interface IUserDetailData {
  id: number;
  attributes: IUserDetailAttributes;
}
export interface IUserDetailAttributes {
  name: string;
  designation: string;
  empCode: string;
  phoneNumber: string;
  date_of_birth: string;
  joinig_date: string;
  joining_announced: boolean;
  status: boolean;
  active_blogs: boolean | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Photo: IPhotoRelation;
}
export interface IPhotoRelation {
  data: IPhotoData[];
}
export interface IPhotoData {
  id: number;
  attributes: IPhotoAttributes;
}
export interface IPhotoAttributes {
  name: string;
  url: string;
  mime: string;
  ext: string;
  size: number;
  width: number;
  height: number;
  alternativeText: string | null;
  caption: string | null;
  previewUrl: string | null;
  provider: string;
  provider_metadata: {
    path: string;
    bucket: string;
  };
  formats: {
    thumbnail?: {
      url: string;
      width: number;
      height: number;
      ext: string;
      mime: string;
      size: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export const statusList = ["Pending", "Approved", "Declined"] as const;
export type UIStatus = (typeof statusList)[number];

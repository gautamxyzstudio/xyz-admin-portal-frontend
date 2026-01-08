export type IApplyLeaveArgs = {
  data: {
    start_date: string;
    end_date: string;
    description: string;
    status: "pending";
    decline_reason: string;
    title: string;
    leave_category: "short_leave" | "half_day" | "full_day";
    leave_type: "CL" | "EL" | "SL" | "un_paid" | null;
    half_day_type: "first_half" | "second_half" | null;
    start_time?: string | null;
    user: string | number;
  };
};

export interface ILeave {
  [x: string]: string;
  start_date: string;
  id?: number;
  end_date: string;
  status: "pending" | "approved" | "rejected" | "declined";
  createdAt: string;
  description: string;
  decline_reason: string;
  title: string;
   start_time?: string | null;
  days?: string;
  leave_category: "short_leave" | "half_day" | "full_day";
  half_day_type: "first_half" | "second_half";
  leave_type?: "CL" | "EL" | "SL" | "un_paid";
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
  status: "pending" | "approved" | "rejected" | "declined";
  createdAt: string;
  description: string;
  decline_reason: string;
  title: string;
   start_time?: string | null;
  days?: string;
  leave_category: "short_leave" | "half_day" | "full_day";
  half_day_type: "first_half" | "second_half" | null;
  leave_type: "CL" | "EL" | "SL" | "un_paid" | null;
}

export interface ILeaveResponse {
  data: {
    id: number;
    attributes: {
      start_date: string;
      end_date: string;
      status: "pending" | "approved" | "rejected";
      createdAt: string;
      description: string;
      decline_reason: string;
       start_time?: string | null;
      title: string;
      leave_category: "short_leave" | "half_day" | "full_day";
      half_day_type: "first_half" | "second_half";
      leave_type: "CL" | "EL" | "SL" | "un_paid";
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
  status?: "pending" | "approved" | "rejected" | "declined";
  decline_reason?: string;
  title: string;
  user: string | number;
  leave_category?: "short_leave" | "half_day" | "full_day";
   start_time?: string | null;
  half_day_type: "first_half" | "second_half";
  leave_type: "CL" | "EL" | "SL" | "un_paid";
}

export interface IApproveLeaveResponse {
  message: string;
  data: {
    id: number;
    start_date: string;
    end_date: string;
    status: "pending" | "approved" | "rejected" | "declined";
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    description: string;
    decline_reason: string;
    title: string;
    leave_category: "short_leave" | "half_day" | "full_day";
    half_day_type: "first_half" | "second_half" | null;
    leave_type: "CL" | "EL" | "SL" | "un_paid"| null;
    start_time: string | null;
  };
  leaveDaysDeducted: number;
}

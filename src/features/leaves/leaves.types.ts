export type IApplyLeaveArgs = {
  data: {
    start_date: string;
    end_date: string;
    description: string;
    status: 'pending';
    decline_reason: string;
    title: string;
    leave_duration: 'short_leave' | 'half_day' | 'full_day';
    is_paid: boolean;
    is_first_half: boolean;
    leave_type: 'Casual' | 'Unpaid';
    start_time?: string;
    user: string | number;
  };
};

export interface ILeave {
  start_date: string;
  id?: number;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  description: string;
  decline_reason: string;
  title: string;
  start_time?: string;
  leave_duration: 'short_leave' | 'half_day' | 'full_day';
  is_paid: boolean;
  is_first_half: boolean;
  user: {
    data: {
      id: number;
      attributes: {
        username: string;
        email: string;
        provider: 'local';
        confirmed: boolean;
        blocked: boolean;
        user_type: 'Employee';
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

export interface ILeaveResponse {
  data: {
    id: number;
    attributes: {
      start_date: string;
      end_date: string;
      status: 'pending' | 'approved' | 'rejected';
      createdAt: string;
      description: string;
      decline_reason: string;
      start_time?: string;
      title: string;
      leave_duration: 'short_leave' | 'half_day' | 'full_day';
      is_paid: boolean;
      is_first_half: boolean;
      user: {
        data: {
          id: number;
          attributes: {
            username: string;
            email: string;
            provider: 'local';
            confirmed: true;
            blocked: boolean;
            user_type: 'Employee';
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
  status?: 'approved' | 'rejected' | 'pending';
  decline_reason?: string;
  title: string;
  user: string | number;
  leave_duration?: 'short_leave' | 'half_day' | 'full_day';
  start_time?: string;
  is_first_half?: boolean;
  is_paid?: boolean;
}

export interface IApproveLeaveResponse {
  message: string;
  data: {
    id: number;
    start_date: string;
    end_date: string;
    status: 'approved' | 'rejected' | 'pending';
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    description: string;
    decline_reason: string;
    title: string;
    leave_duration: 'short_leave' | 'half_day' | 'full_day';
    is_paid: boolean;
    is_first_half: boolean;
    start_time: string | null;
  };
  leaveDaysDeducted: number;
}

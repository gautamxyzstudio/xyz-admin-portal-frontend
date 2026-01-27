import type { ILeave } from "../leaves/leaves.types";

export interface IAttendance {
  id: number;
  in: string | null;
  out: string | null;
  Date: string;
}
export interface IHrDashboardState {
  leaveRequests: ILeave[];
}

export interface IAttendanceState {
  checkInTime: string | null;
  checkOutTime: string | null;
  attendanceId: number | null;
}

export interface IGetTodayAttendanceRequest {
  id: number;
}

export interface IGetTodayAttendanceResponse {
  id: number;
  in: Date | null;
  out: Date | null;
  Date: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface IAttendance {
  id: number;
  in: string | null;
  out: string | null;
  Date: string;
  is_checked_in: boolean;
  attendance_seconds: number;
  checkin_started_at: string | null;
}

export interface ICheckInRequest {
  data: {
    in: string;
    out: string;
    date: string;
    user: number;
    checkin_started_at: string
  };
}

export interface ICheckOutRequest {
  data: {
    out: string;
    id: number;
  };
}

export interface IUserAttendance {
  id: number;
  in: string | null;
  out: string | null;
  Date: string;
  attendance_seconds: number;
  user: {
    email: string;
    id: number;
    user_detial: {
      empCode: string;
      name: string;
      Photo: [
        {
          url: string;
        }
      ];
    };
  };
}

export interface IGetAllAttendanceResponse {
  data: {
    id: number;
    in: string | null;
    out: string | null;
    Date: string;
    attendance_seconds: number;
    user: {
      id: number;
      user_detial: {
        name: string;
        Photo: [
          {
            url: string;
          }
        ];
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

export interface IUpdateAttendanceRequest {
  in: string;
  out: string;
}

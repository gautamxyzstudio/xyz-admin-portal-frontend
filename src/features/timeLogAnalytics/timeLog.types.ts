export interface IWorkLogTask {
  work_log_id: number;
  date: string;
  project_name: string;
  work_log_title: string;
  total_time_taken: number;
}

export interface ICurrentTask {
  work_log_id: number;
  project_name: string;
  work_log_title: string;
  started_at: string;
}

export interface IEmployeeWorkLog {
  employee_id: number;
  employee_username: string;
  photo_url: string | null;
  current_task?: ICurrentTask | null;
  work_logs: IWorkLogTask[];
}

export interface TimeLogAnalyticsResponse {
  employees?: IEmployeeWorkLog[];
  // Legacy support
  userId?: string;
  count?: number;
  endDate?: string;
  startDate?: string;
  work_logs?: WorkLog[];
}

export interface WorkLog {
  id: number;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  active_task_id: number | null;
  total_time_taken: number;
  work_date: string;
  user: User;
}

export interface Task {
  status: "in-progress" | "completed";
  project: Project | null;
  task_id: number;
  task_key: string;
  createdAt: string;
  is_running: boolean;
  task_title: string;
  time_spent: number;
  work_sessions: WorkSession[];
  last_started_at: string | null;
}

export interface Project {
  id: number;
  title: string;
}

export interface WorkSession {
  start: string;
  end: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: "Employee" | string;
}

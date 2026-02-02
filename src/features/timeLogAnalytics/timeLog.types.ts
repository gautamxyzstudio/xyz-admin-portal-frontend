export interface TimeLogAnalyticsResponse {
  userId: string;      
  count: number;           
  work_logs: WorkLog[];
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

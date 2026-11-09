export interface ITaskBoardProject {
  id: number;
  title: string;
  logo_url: string | null;
  in_progress_tasks_count: number;
  planned_tasks_count?: number;
  blocked_tasks_count?: number;
  completed_tasks_count?: number;
}

export type TaskStatus = "planned" | "in-progress" | "completed" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export interface IEmployeeTask {
  id: number;
  taskId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority | null;
  estimatedMinutes: number | null;
  dueDate: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  project: { id: number; title: string } | null;
  timeSpentSeconds: number;
  totalTimeSpentSeconds: number;
  overtimeMinutes: number;
  isRunning: boolean;
}

export interface IEmployeeTaskSummary {
  totalTasks: number;
  openTasks: number;
  statusCounts: Record<TaskStatus, number>;
  highPriorityOpen: number;
  overdue: number;
  totalTimeSeconds: number;
  estimatedMinutes: number;
  overtimeMinutes: number;
  runningTask: { id: number; title: string; taskId: string | null } | null;
  mostTimeTask: {
    id: number;
    title: string;
    taskId: string | null;
    timeSpentSeconds: number;
  } | null;
}

export interface ITaskBoardEmployee {
  id: number;
  username: string;
  name: string;
  email: string;
  designation: string | null;
  userType: string | null;
  blocked: boolean;
  photo: string | null;
  summary: IEmployeeTaskSummary;
  tasks: IEmployeeTask[];
}

export interface ITaskBoardEmployeesResponse {
  isElevatedUser: boolean;
  employees: ITaskBoardEmployee[];
}

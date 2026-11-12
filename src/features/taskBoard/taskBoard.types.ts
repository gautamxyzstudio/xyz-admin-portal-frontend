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
  /** Assignee's time logged today (IST) */
  todaySeconds: number;
  /** Only present when a date range is requested */
  range: IEmployeeTaskRange | null;
}

export interface IEmployeeTaskRange {
  /** task existed by the end of the range */
  existed: boolean;
  /** status the task had at the end of the range */
  statusAtEnd: TaskStatus | null;
  /** assignee's time logged inside the range */
  seconds: number;
  /** everyone's time logged on the task up to the end of the range */
  loggedByEndSeconds: number;
  /** estimate left at the end of the range (0 if done / no estimate) */
  onPlateSeconds: number;
}

export interface IEmployeeTaskSummary {
  totalTasks: number;
  openTasks: number;
  statusCounts: Record<TaskStatus, number>;
  highPriorityOpen: number;
  overdue: number;
  totalTimeSeconds: number;
  todaySeconds: number;
  range: {
    from: string;
    to: string;
    seconds: number;
    onPlateSeconds: number;
    openTasks: number;
    noEstimate: number;
  } | null;
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
  today: string | null;
  range: { from: string; to: string } | null;
  employees: ITaskBoardEmployee[];
}

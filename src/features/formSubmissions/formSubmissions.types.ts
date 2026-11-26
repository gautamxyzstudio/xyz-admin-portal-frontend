export interface IFormSubmissionReader {
  id: number;
  name: string;
  readAt: string;
}

export interface IFormSubmission {
  id: number;
  documentId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  message: string | null;
  formType: string | null;
  pageUrl: string | null;
  targetKeywords: string | null;
  budget: string | null;
  createdAt: string;
  readBy: IFormSubmissionReader[];
  /** read by the logged-in user */
  isRead: boolean;
}

export type FormSubmissionStatus = "all" | "unread" | "read";

export interface IFormSubmissionsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  formType?: string;
  status?: FormSubmissionStatus;
}

export interface IFormSubmissionsResponse {
  data: IFormSubmission[];
  meta: {
    pagination: { page: number; pageSize: number; pageCount: number; total: number };
    unreadCount: number;
    formTypes: string[];
  };
}

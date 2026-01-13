import type { IPagination } from "../../state/types";

export type AnnouncementPayload = {
  title: string;
  description: string;
  date: string;
};

export interface IAnnouncement {
  id: number;
  attributes: {
    Date: string; // ISO date string (YYYY-MM-DD)
    Title: string;
    Description: string;
    createdAt: string; // ISO datetime
    updatedAt: string; // ISO datetime
    publishedAt: string; // ISO datetime
  };
}

export interface IAnnouncementApiResponse {
  data: IAnnouncement;
}
export interface IAnnouncementResponse {
  data: IAnnouncement[];
  meta: {
    pagination: IPagination;
  };
}

export interface IAnnouncementUI {
  id: number;
  date: string;
  title: string;
  description: string;
}

export interface IAnnouncementRequest {
  data: {
    Title: string;
    Description: string;
    Date: string;
  };
}

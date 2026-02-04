
/* ===============================
   STRAPI BASE TYPES
================================ */

export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface StrapiRelation<T> {
  data: T | T[] | null;
}

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/* ===============================
   MEDIA (logo)
================================ */

export interface MediaAttributes {
  url: string;
}

export type MediaEntity = StrapiEntity<MediaAttributes>;

/* ===============================
   USER (minimal)
================================ */

export interface UserAttributes {
  username: string;
}

export type UserEntity = StrapiEntity<UserAttributes>;

/* ===============================
   PROJECT (STRAPI RAW)
================================ */

export interface ProjectAttributes {
  title: string;
  description?: string;

  users_permissions_users: StrapiRelation<UserEntity>;
  logo?: StrapiRelation<MediaEntity>;

  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type ProjectEntity = StrapiEntity<ProjectAttributes>;

/* ===============================
   GET PROJECTS RESPONSE
================================ */

export type GetProjectsResponse = StrapiResponse<ProjectEntity>;

/* ===============================
   UI NORMALIZED PROJECT
================================ */

export interface ProjectUI {
  id: number;
  title: string;
  users: {
    id: number;
    username: string;
  }[];
  logoUrl?: string;
}

/* ===============================
   POST / PUT PAYLOAD
================================ */

export type ProjectUserId = number | string;

export interface ProjectPayload {
  title: string;
  description?: string;
  users_permissions_users: ProjectUserId[];
  logo?: ProjectUserId | null;
}

export interface UpdateProjectArgs {
  id: number;
  data: ProjectPayload;
}

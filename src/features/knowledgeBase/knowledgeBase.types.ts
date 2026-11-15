export interface KbUserRef {
  id: number;
  username: string;
}

export interface KbProject {
  id: number;
  title: string;
  description: string;
  logo_url: string | null;
  article_count: number;
  last_updated: string | null;
}

export interface KbProjectsResponse {
  isElevated: boolean;
  projects: KbProject[];
}

export interface KbArticle {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: KbUserRef | null;
  lastEditedBy: KbUserRef | null;
  canDelete: boolean;
}

export interface KbArticlesResponse {
  project: { id: number; title: string };
  articles: KbArticle[];
}

export interface KbArticlePayload {
  title: string;
  content: string;
}

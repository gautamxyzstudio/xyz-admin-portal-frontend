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
  /** Set when the article is an uploaded document (PDF / Word / Markdown / text). */
  file?: KbFile | null;
}

export interface KbFile {
  id: number;
  name: string;
  ext: string; // ".pdf", ".docx", ".md" …
  mime: string;
  size: number; // bytes
  url: string;
}

export interface KbArticlesResponse {
  project: { id: number; title: string };
  articles: KbArticle[];
}

export interface KbArticlePayload {
  title: string;
  content: string;
}

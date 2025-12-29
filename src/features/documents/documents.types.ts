export interface IDocument {
  data: {
    documentName: string;
    document: string | number;
    user: number;
  };
}

export interface IDocumentFileAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    small?: {
      ext: string;
      url: string;
      hash: string;
      mime: string;
      name: string;
      path: string | null;
      size: number;
      width: number;
      height: number;
      sizeInBytes: number;
    };
    thumbnail?: {
      ext: string;
      url: string;
      hash: string;
      mime: string;
      name: string;
      path: string | null;
      size: number;
      width: number;
      height: number;
      sizeInBytes: number;
    };
    medium?: {
      ext: string;
      url: string;
      hash: string;
      mime: string;
      name: string;
      path: string | null;
      size: number;
      width: number;
      height: number;
      sizeInBytes: number;
    };
    large?: {
      ext: string;
      url: string;
      hash: string;
      mime: string;
      name: string;
      path: string | null;
      size: number;
      width: number;
      height: number;
      sizeInBytes: number;
    };
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IDocumentFile {
  id: number;
  attributes: IDocumentFileAttributes;
}

export interface IDocumentResponse {
  id: number;
  attributes: {
    documentName: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    document: {
      data: IDocumentFile;
    };
  };
}

export interface IDocumentsListResponse {
  data: IDocumentResponse[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

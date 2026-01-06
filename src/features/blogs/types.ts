export interface IBlogResponse {
  id: number;
  attributes: {
    title: string;
    shortDesc?: string | null;
    BlogDate?: string; // API returns string, not Date
    banner?: {
      data?: {
        id: number;
        attributes: {
          url: string;
          name: string;
          formats?: {
            small?: { url: string };
            medium?: { url: string };
            large?: { url: string };
            thumbnail?: { url: string };
          };
        };
      } | null;
    } | null;
  };
}

export interface IFetchBlogsResponse {
  data: IBlogResponse[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

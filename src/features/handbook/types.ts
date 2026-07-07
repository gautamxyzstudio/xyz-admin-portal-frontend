export interface ICreateEmployeeHandbookArgs {
  hand_book_file: File;
}

export interface IGetHandbookListResponse {
  id: number;
  hand_book_file: {
    id: number;
    url: string;
    name: string;
    size: number;
    ext: string;
    mime: string;
  };
}

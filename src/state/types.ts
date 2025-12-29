export interface ICustomErrorResponse {
  message: string;
  statusCode: number | string;
}

export interface IErrorResponse {
  status: number | string;
  data: {
    data: null;
    error: {
      status: number;
      name: string;
      message: string;
      details: object;
    };
  };
}

export const transformErrorResponse = (
  response: IErrorResponse
): ICustomErrorResponse => {
  return {
    message: response?.data?.error?.message ?? 'Something went wrong',
    statusCode: response?.status ?? 0,
  };
};

export type IPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export const ApiMethodType = {
  get: 'GET',
  post: 'POST',
  patch: 'PATCH',
  PUT: 'PUT',
  delete: 'DELETE',
  update: 'UPDATE',
};

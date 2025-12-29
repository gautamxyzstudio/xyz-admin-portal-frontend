export interface IUserMutationArgs {
  type: 'post' | 'put' | 'delete' | 'get' | 'patch';
  url: string;
  body?: Record<string, unknown> | FormData;
  token?: string;
}

export type IUserMutationState = {
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  data?: any;
  error?: ICustomizedError | null;
};

export type ICustomizedError = {
  statusCode: number;
  message: string;
};

export type IResult = {
  status: boolean;
};

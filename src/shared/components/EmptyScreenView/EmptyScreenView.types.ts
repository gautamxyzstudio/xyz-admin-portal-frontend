import type { ICustomErrorResponse } from '../../../state/types';

export interface IEmptyScreenViewProps {
  emptyViewTitle?: string;
  emptyViewSubTitle?: string;

  illustrationStyes?: string;
  retryHandler?: () => void;
  error?: ICustomErrorResponse | undefined;
  isDataEmpty?: boolean;
}

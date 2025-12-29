/* eslint-disable @typescript-eslint/no-explicit-any */

import type{ TableProps } from '@mui/material';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import type { IEmptyScreenViewProps } from '../EmptyScreenView/EmptyScreenView.types';

export interface IDataTableProps extends TableProps, IEmptyScreenViewProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  isLoading: boolean;
  headerView?: React.ReactNode;
  tableHeightPercent?: number;
  onPressPageChange?: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => void;
  footerComponent?:
    | React.ComponentType<{
        context?: any;
      }>
    | undefined;
  withPagination: boolean;
  page?: number;
  totalCount?: number;
}

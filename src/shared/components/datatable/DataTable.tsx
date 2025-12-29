/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useCallback, useMemo } from 'react';
import { TableVirtuoso, type TableComponents } from 'react-virtuoso';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableFooter,
  TablePagination,
} from '@mui/material';
import type { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import type { IDataTableProps } from './DataTable.types';
import EmptyScreenView from '../EmptyScreenView/EmptyScreenView';
import React from 'react';

const DataTable: React.FC<IDataTableProps> = ({
  rows,
  columns,
  isLoading,
  tableHeightPercent = 100,
  headerView,
  withPagination,
  onPressPageChange,
  totalCount,
  page,
  emptyViewSubTitle,
  emptyViewTitle,
  isDataEmpty,
  error}) => {
  const { data } = useDemoData({
    rowLength: 10,
    maxColumns: 9,
    dataSet: 'Employee',
  });

  const tableContainerStyles = useMemo(() => {
    return {
      boxShadow: 'none',
      backgroundColor: '#fff',
      height: `${tableHeightPercent}%`,
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    };
  }, [tableHeightPercent]);

  const tableStyles = useMemo(() => {
    return {
      boxShadow: 'none',
      borderCollapse: 'separate',
      position: 'sticky',
      tableLayout: 'fixed',
      width: '100%',
    };
  }, []);

  const rowStyles = useMemo(() => {
    return { border: 'none' };
  }, []);

  const tableCellStyles = useMemo(() => {
    return {
      backgroundColor: '#FAFAFA',
      color: '#868686',
      borderRight: '1px solid #EBEBEB',
      height: 10,
      '.MuiTableCell-head': {
        padding: '8px',
      },
      borderBottomColor: '#EBEBEB',
    };
  }, []);

  const tableHeadStyles = useMemo(() => {
    return {
      display: 'table-header-group',
      padding: '1rem 1rem 0 1rem',
      borderRadius: '0.75rem 0.75rem 0 0',
      backgroundColor: '#FAFAFA',
    };
  }, []);

  const VirtuosoTableComponents: TableComponents = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
      <TableContainer
        component={Paper}
        sx={tableContainerStyles}
        {...props}
        ref={ref}
      />
    )),
    Table: (props: any) => <Table {...props} sx={tableStyles} />,
    TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableHead {...props} sx={tableHeadStyles} ref={ref} />
    )),
    TableRow,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableBody {...props} ref={ref} />
    )),
    TableFoot: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableFooter
        sx={{
          position: 'relative !important',
          display: 'flex !important',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        {...props}
        ref={ref}
      />
    )),
  };

  const rowContent = useCallback(
    (index: number, row: GridValidRowModel) => (
      <>
        {columns.map((column, _index) => {
          return (
            <TableCell
              className="bg-white"
              style={{
                position: column.headerName === 'Action' ? 'sticky' : 'unset',
                right: column.headerName === 'Action' ? 0 : 'unset',
                zIndex: column.headerName === 'Action' ? 1 : 0.5,
                cursor: column.headerName === 'Action' ? 'pointer' : 'unset',
                backgroundColor:
                  column.headerName === 'Action' ? '#fafafa' : '#fff',
              }}
              key={_index}
              sx={{ ...rowStyles, width: column.width }}
              align="left"
            >
              {column.field === 'sNum' ? (
                <span>{index + 1}</span>
              ) : (
                <>
                  {column.renderCell
                    ? column.renderCell({ row } as GridRenderCellParams)
                    : row[column.field]}
                </>
              )}
            </TableCell>
          );
        })}
      </>
    ),
    [columns, rowStyles]
  );

  const rowContentLoading = useCallback(
    () => (
      <>
        {columns.map((column) => (
          <TableCell
            key={column.field}
            sx={{ ...rowStyles, width: column.width }}
            align="left"
          >
            <div className="animate-pulse flex space-x-4">
              <div
                style={{ width: column.width }}
                className="bg-slate-300 h-5"
              />
            </div>
          </TableCell>
        ))}
      </>
    ),
    [columns, rowStyles]
  );

  const fixedHeaderContent = useCallback(
    () => (
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.field}
            variant="head"
            align="left"
            style={{
              width: column.width,
              position: column.headerName === 'Action' ? 'sticky' : 'unset',
              right: column.headerName === 'Action' ? 0 : 'unset',
              zIndex: column.headerName === 'Action' ? 1 : 0.5,
            }}
            sx={tableCellStyles}
          >
            {column.headerName}
          </TableCell>
        ))}
      </TableRow>
    ),
    [columns, tableCellStyles]
  );

  return (
    <div className="w-full h-full bg-white border overflow-hidden border-[#dbdbdb] rounded-lg">
      <div className="w-full mb-4">{headerView}</div>
      {!isLoading && rows?.length === 0 ? (
        <div className="h-full flex justify-center items-center">
          <EmptyScreenView
            emptyViewTitle={emptyViewTitle}
            emptyViewSubTitle={emptyViewSubTitle}
            error={error}
            isDataEmpty={isDataEmpty}
          />
        </div>
      ) : (
        <TableVirtuoso
          data={isLoading ? data.rows : rows}
          components={VirtuosoTableComponents as any}
          defaultItemHeight={68}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={isLoading ? rowContentLoading : rowContent}
        />
      )}
      {withPagination && !isDataEmpty && onPressPageChange && (
        <TablePagination
          className="stick"
          component="div"
          sx={{
            '.MuiTablePagination-toolbar': {
              minHeight: '40px',
            },
          }}
          height={32}
          count={totalCount ?? 0}
          page={page ? page - 1 : 0}
          rowsPerPage={10}
          rowsPerPageOptions={[]}
          onPageChange={onPressPageChange}
        />
      )}
    </div>
  );
};

export default memo(DataTable);

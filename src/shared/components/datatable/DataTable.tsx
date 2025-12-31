/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useCallback, useMemo } from "react";
import { TableVirtuoso, type TableComponents } from "react-virtuoso";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableFooter,
} from "@mui/material";
import type { GridRenderCellParams, GridValidRowModel } from "@mui/x-data-grid";
import { useDemoData } from "@mui/x-data-grid-generator";
import type { IDataTableProps } from "./DataTable.types";
import React from "react";
 import EmptyScreenView from "../EmptyScreenView/EmptyScreenView";

const DataTable: React.FC<IDataTableProps> = ({
  rows,
  columns,
  isLoading,
  tableHeight = 100,
  headerView,
  withPagination,
  paginationControls,
  emptyViewSubTitle,
  emptyViewTitle,
  isDataEmpty,
  error,
  customStyles,
  illustrationStyes,
  onRowClick,
}) => {
  const { data } = useDemoData({
    rowLength: 10,
    maxColumns: 9,
    dataSet: "Employee",
  });

  const tableContainerStyles = useMemo(() => {
    return {
      boxShadow: "none",
      backgroundColor: "#fff",
      height: `${tableHeight}px !important`,
      minHeight: "220px",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    };
  }, [tableHeight]);

  const tableStyles = useMemo(() => {
    return {
      boxShadow: "none",
      borderCollapse: "separate",
      position: "sticky",
      tableLayout: "fixed",
      width: "100%",
    };
  }, []);

  const rowStyles = useMemo(() => {
    return { borderBottomColor: "#0D07011F", padding: "10px" };
  }, []);

  const tableCellStyles = useMemo(() => {
    return {
      color: "#0F0700",
      fontSize: "14px",
      fontWeight: 400,
      border: 0,
    };
  }, []);

  const tableHeadStyles = useMemo(() => {
    return {
      display: "table-header-group",
      top: "-2px !important",
      backgroundColor: "#F8F8F8",
      "& .MuiTableCell-root": {
        padding: "10px",
      },
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
      <TableBody
        {...props}
        ref={ref}
        sx={{
          "& .MuiTableRow-root": {
            borderBottom: "1px solid #F8F8F8 ",
            borderRadius: "8px",
            cursor: onRowClick ? "pointer" : "unset",
            "&:hover": {
              backgroundColor: "#F8F8F8",
            },
          },
        }}
      />
    )),
    TableFoot: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableFooter
        sx={{
          position: "relative !important",
          display: "flex !important",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
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
              style={{
                position: column.headerName === "Action" ? "sticky" : "unset",
                right: column.headerName === "Action" ? 0 : "unset",
                zIndex: column.headerName === "Action" ? 1 : 0.5,
                cursor: column.headerName === "Action" ? "pointer" : "unset",
              }}
              key={_index}
              sx={{
                ...rowStyles,
                width: column.width,
              }}
              align="left"
              onClick={() => onRowClick?.(row as any,)} // ✅ row click trigger
            >
              {column.field === "sNum" ? (
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
    [columns, rowStyles, onRowClick]
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
              position: column.headerName === "Action" ? "sticky" : "unset",
              right: column.headerName === "Action" ? 0 : "unset",
              zIndex: column.headerName === "Action" ? 1 : 0.5,
            }}
            sx={{
              ...tableCellStyles,
              "&:first-of-type": {
                borderTopLeftRadius: "8px",
                borderBottomLeftRadius: "8px",
              },
              "&:last-of-type": {
                borderTopRightRadius: "8px",
                borderBottomRightRadius: "8px",
              },
            }}
          >
            {column.headerName}
          </TableCell>
        ))}
      </TableRow>
    ),
    [columns, tableCellStyles]
  );

  return (
    <div className={`w-full h-full flex flex-col ${customStyles}`}>
      <div className="w-full">{headerView}</div>
      {!isLoading && rows?.length === 0 ? (
        <div className="h-full flex justify-center items-center">
          <EmptyScreenView
            emptyViewTitle={emptyViewTitle}
            emptyViewSubTitle={emptyViewSubTitle}
            error={error}
            isDataEmpty={isDataEmpty}
            illustrationStyes={illustrationStyes}
           
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
      {withPagination && !isDataEmpty && paginationControls}
    </div>
  );
};

export default memo(DataTable);

import React from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export interface ReusableTableColumn<T> {
  key: string;
  header: string | React.ReactNode;
  sortKey?: string;
  className?: string;
  headerClassName?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface ReusableTableProps<T> {
  data: T[];
  columns: ReusableTableColumn<T>[];
  rowKey: (item: T, index: number) => string | number;
  onRowClick?: (item: T) => void;
  // Sorting props
  sortKey?: string | null;
  sortOrder?: "asc" | "desc";
  onSort?: (key: any) => void;
  // Empty states
  emptyState?: React.ReactNode;
  // Fixed row count padding
  padEmptyRowsTo?: number;
  // Class overrides
  className?: string;
  headerRowClassName?: string;
  rowClassName?: string;
}

export function ReusableTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  sortKey,
  sortOrder,
  onSort,
  emptyState,
  padEmptyRowsTo,
  className,
  headerRowClassName,
  rowClassName,
}: ReusableTableProps<T>) {
  const handleHeaderClick = (column: ReusableTableColumn<T>) => {
    if (column.sortKey && onSort) {
      onSort(column.sortKey);
    }
  };

  const activeColumns = columns.filter(Boolean);

  // Pad table with empty rows if padEmptyRowsTo is set
  const displayRows = [...data];
  if (padEmptyRowsTo && padEmptyRowsTo > data.length) {
    const emptyRowsCount = padEmptyRowsTo - data.length;
    for (let i = 0; i < emptyRowsCount; i++) {
      displayRows.push(null as any);
    }
  }

  return (
    <div className={cn("overflow-x-auto w-full", className)}>
      <Table className="w-full border-separate border-spacing-0">
        <TableHeader className="h-14">
          <TableRow className={cn("border-[#E2E8F0] dark:border-slate-800 bg-[#F7F9FA] dark:bg-slate-900/50", headerRowClassName)}>
            {activeColumns.map((col) => {
              const isSortable = !!col.sortKey && !!onSort;
              return (
                <TableHead
                  key={col.key}
                  onClick={() => handleHeaderClick(col)}
                  className={cn(
                    "px-6 py-3.5 text-sm text-gray-900 dark:text-slate-200 font-medium capitalize border-b border-[#E2E8F0] dark:border-slate-800 transition-colors",
                    isSortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 select-none",
                    col.headerClassName
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2",
                    col.headerClassName?.includes("justify-center") && "justify-center",
                    col.headerClassName?.includes("justify-end") && "justify-end"
                  )}>
                    {isSortable && (
                      <ArrowUpDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          sortKey === col.sortKey
                            ? "text-gray-900 dark:text-slate-100"
                            : "text-gray-400 dark:text-slate-600",
                          sortKey === col.sortKey && sortOrder === "desc" && "rotate-180"
                        )}
                      />
                    )}
                    <span>{col.header}</span>
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-200 dark:divide-slate-800">
          {data.length === 0 && !padEmptyRowsTo ? (
            <TableRow>
              <TableCell
                colSpan={activeColumns.length}
                className="h-24 text-center align-middle whitespace-normal"
              >
                {emptyState || (
                  <span className="text-gray-500 dark:text-slate-500">
                    No data available
                  </span>
                )}
              </TableCell>
            </TableRow>
          ) : (
            displayRows.map((item, idx) => {
              if (item === null || item === undefined) {
                // Render placeholder row
                return (
                  <TableRow
                    key={`empty-${idx}`}
                    className="h-[60px] even:bg-[#F7F9FA] dark:even:bg-slate-900 odd:bg-white dark:odd:bg-slate-800/30 border-b border-[#E2E8F0] dark:border-slate-800/50"
                  >
                    {activeColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        className="px-6 py-4 text-gray-200 dark:text-slate-800 text-sm"
                      >
                        &nbsp;
                      </TableCell>
                    ))}
                  </TableRow>
                );
              }

              return (
                <TableRow
                  key={rowKey(item, idx)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    "even:bg-[#F7F9FA] dark:even:bg-slate-900 odd:bg-white dark:odd:bg-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-[#E2E8F0] dark:border-slate-800/50",
                    rowClassName
                  )}
                >
                  {activeColumns.map((col) => {
                    const content = col.render
                      ? col.render(item, idx)
                      : (item as any)[col.key];

                    return (
                      <TableCell
                        key={col.key}
                        className={cn(
                          "px-6 py-4 text-sm align-middle text-gray-900 dark:text-slate-100",
                          col.className
                        )}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

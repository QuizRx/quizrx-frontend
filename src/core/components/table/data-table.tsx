"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import React, { ReactNode } from "react";
import { ScrollArea, ScrollBar } from "@/core/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { Skeleton } from "@/core/components/ui/skeleton";
import { SideDrawer } from "../ui/side-drawer";


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: boolean;
  header?: ReactNode;
  actions?: {
    onEdit?: (item: TData) => void;
    onDelete?: (id: string) => void;
  };
  isLoading?: boolean;
  error?: string | null;
  loadingRowCount?: number;
  headerStyle?: string;
  onRowSelectionChange?:any;
  customRowSelection?: any
  drawerType?: 'question' | 'quiz' | 'question-bank' | 'mock-exam' | null
  refetchFunction?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination = false,
  header,
  actions,
  isLoading = false,
  error = null,
  loadingRowCount = 5,
  headerStyle,
  drawerType = null,
  onRowSelectionChange,
  customRowSelection,
  refetchFunction
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});

  const [isSideDrawerOpen, setIsSideDrawerOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState({});;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: onRowSelectionChange || setRowSelection,
    meta: {
      actions,
    },
    state: {
     rowSelection: customRowSelection || rowSelection,
    },
  });

  const handleRowClick = (event: React.MouseEvent, row: any) => {
    // Prevent sidebar from opening when clicking on checkboxes or other interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('input[type="checkbox"]') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('[data-radix-collection-item]')) {
      return;
    }

    setIsSideDrawerOpen(true);
    setSelectedRow(row);
  };

  return (
    <div className="w-full my-5">
      {/* Custom header area */}
      {header && (
        <div className="p-4  border-t border-muted border-l border-r rounded-t-sm">
          {header}
        </div>
      )}

      <div
        className={`border border-border rounded-sm ${
          header && "rounded-t-none"
        }`}
      >
        <ScrollArea className="w-full">
          <ScrollBar orientation="horizontal" />
          <Table className="w-full rounded-lg">
            <TableHeader className="bg-card rounded-lg">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border rounded-lg"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`text-foreground font-semibold p-4 ${headerStyle}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className="bg-card">
              {isLoading || !data ? (
                Array.from({ length: loadingRowCount }).map((_, index) => (
                  <TableRow
                    key={`loading-row-${index}`}
                    className="border-b border-border"
                  >
                    {Array.from({ length: columns.length }).map(
                      (_, cellIndex) => (
                        <TableCell
                          key={`loading-cell-${index}-${cellIndex}`}
                          className="p-4"
                        >
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-foreground/90"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`border-b border-border hover:border-border/20 ${
                      drawerType && "hover:cursor-pointer hover:bg-gray-100"
                    }`}
                    onClick={(event) => handleRowClick(event, row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="p-4 text-foreground/90 text-xs"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {drawerType && (
        <SideDrawer
          drawerType={drawerType}
          isOpen={isSideDrawerOpen}
          data={selectedRow}
          onOpenChange={setIsSideDrawerOpen}
          refetchFunction={refetchFunction}
        />
      )}
    </div>
  );
}

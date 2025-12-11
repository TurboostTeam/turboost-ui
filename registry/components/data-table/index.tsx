"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ButtonGroup } from "@/components/ui/button-group";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type {
  Column,
  ColumnDef,
  RowData,
  RowSelectionState,
  TableOptions,
} from "@tanstack/react-table";

import type { CSSProperties, ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function getCommonPinningStyles<TData>(column: Column<TData>): CSSProperties {
  const isPinned = column.getIsPinned();

  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    width: column.getSize(),
  };
}

function getCommonPinningClassNames<TData>(column: Column<TData>): string {
  const isPinned = column.getIsPinned();
  return cn(isPinned ? "sticky z-1" : "relative z-0");
}

export interface DataTablePaginationProps {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
}

export type DataTableColumnProps<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<TData, TValue> & {
  pinned?: "left" | "right" | false;
};

export interface DataTableProps<TData extends RowData, TValue = unknown> {
  columns: Array<DataTableColumnProps<TData, TValue>>;
  data: Array<TData>;

  pagination?: DataTablePaginationProps;

  onRowSelectionChange?: (rows: Array<TData>) => void;
  onAllRowsSelectedChange?: (selected: boolean) => void;

  bulkActions?: ReactNode;

  getRowId?: TableOptions<TData>["getRowId"];
}

export function DataTable<TData extends RowData, TValue = unknown>({
  columns,
  data,
  pagination,
  bulkActions,
  onRowSelectionChange,
  onAllRowsSelectedChange,
  getRowId = (row, index) =>
    (typeof row === "object" &&
    row !== null &&
    "id" in row &&
    (typeof row.id === "string" || typeof row.id === "number")
      ? row.id
      : index
    ).toString(),
}: DataTableProps<TData, TValue>) {
  const columnsWithSelection = useMemo(() => {
    return [
      ...(onRowSelectionChange
        ? [
            {
              id: "select",
              header: ({ table }) => (
                <Checkbox
                  checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                  }
                  onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                  }
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                />
              ),
              enableSorting: false,
              enableHiding: false,
              size: 32,
              pinned: "left",
            } satisfies DataTableColumnProps<TData, TValue>,
          ]
        : []),
      ...columns,
    ];
  }, [columns]);

  const tableColumns: Array<ColumnDef<TData, TValue>> = useMemo(() => {
    return columnsWithSelection.map((column) => ({
      accessorKey: column.id,
      ...column,
    }));
  }, [columnsWithSelection, onRowSelectionChange]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isAllPageRowsSelected, setIsAllPageRowsSelected] = useState(false);

  const table = useReactTable<TData>({
    data,
    columns: tableColumns,
    state: {
      columnPinning: {
        left: columnsWithSelection
          .filter((column) => column.pinned === "left")
          .map((column) => column.id!),
        right: columnsWithSelection
          .filter((column) => column.pinned === "right")
          .map((column) => column.id!),
      },
      rowSelection,
    },
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
  });

  useEffect(() => {
    onRowSelectionChange?.(
      table.getSelectedRowModel().rows.map((row) => row.original),
    );

    if (table.getSelectedRowModel().rows.length !== table.getRowCount()) {
      setIsAllPageRowsSelected(false);
    }
  }, [onRowSelectionChange, table.getSelectedRowModel().rows]);

  useEffect(() => {
    onAllRowsSelectedChange?.(isAllPageRowsSelected);
  }, [isAllPageRowsSelected, onAllRowsSelectedChange]);

  return (
    <div>
      <div className="relative overflow-auto rounded-md border">
        {/* batch actions */}
        {Object.keys(rowSelection).length > 0 && (
          <div className="bg-background absolute top-0 left-0 z-100 flex h-10 w-full items-center gap-2 px-2">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isAllPageRowsSelected
                    ? "All selected"
                    : `${Object.keys(rowSelection).length} selected`}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  {!table.getIsAllPageRowsSelected() && (
                    <DropdownMenuItem
                      onClick={() => table.toggleAllPageRowsSelected(true)}
                    >
                      Select all {table.getRowCount()} on page
                    </DropdownMenuItem>
                  )}

                  {!isAllPageRowsSelected && (
                    <DropdownMenuItem
                      onClick={() => {
                        table.toggleAllPageRowsSelected(true);
                        setIsAllPageRowsSelected(true);
                      }}
                    >
                      Select all
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => table.toggleAllPageRowsSelected(false)}
                  >
                    Unselect all
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {bulkActions}
          </div>
        )}

        <Table className="bg-background table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "bg-background whitespace-normal",
                        getCommonPinningClassNames<TData>(header.column),
                      )}
                      style={{
                        ...getCommonPinningStyles<TData>(header.column),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "bg-background whitespace-normal",
                        getCommonPinningClassNames<TData>(cell.column),
                      )}
                      style={{
                        ...getCommonPinningStyles<TData>(cell.column),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="bg-background h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-center py-4">
          <ButtonGroup>
            <Button
              variant="outline"
              size="icon"
              onClick={pagination.onPreviousPage}
              disabled={!pagination.hasPreviousPage}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={pagination.onNextPage}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight />
            </Button>
          </ButtonGroup>
        </div>
      )}
    </div>
  );
}

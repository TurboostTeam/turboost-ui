import {
  type AccessorKeyColumnDef,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { cloneDeep, groupBy, reduce, sum } from "lodash";
import {
  type ReactElement,
  type RefObject,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

import {
  EmptyState,
  type EmptyStateProps,
} from "@/registry/new-york/blocks/empty-state/empty-state";
import { Button } from "@/registry/new-york/ui/button";
import { Checkbox } from "@/registry/new-york/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/registry/new-york/ui/radio-group";
import { Loader2 } from "lucide-react";

const columnAlignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const columnWrapClass = {
  true: "break-words",
  false: "whitespace-nowrap",
};

export interface TableActionType {
  resetRowSelection: () => void;
}

export type TableColumnProps<T> = ColumnDef<T> & {
  align?: "left" | "center" | "right";
  pin?: "left" | "right" | false;
  wordWrap?: boolean;
};

export interface TableProps<T> {
  tableActionRef?: RefObject<TableActionType | null>;
  emptyStateIcon?: EmptyStateProps["icon"];
  emptyStateTitle?: EmptyStateProps["title"];
  emptyStateDescription?: EmptyStateProps["description"];
  columns: Array<TableColumnProps<T>>;
  rowSelection?: {
    single?: boolean;
    allowSelectAll?: boolean;
    onSelectionChange?: (rows: T[]) => void;
    bulkActions?: (
      rows: T[],
      isSelectedAll: boolean
    ) => React.ComponentProps<"button">[];
  };
  data: T[];
  bodyHeight?: {
    max?: number;
    min?: number;
  };
  loading?: boolean;
  onRow?: (record: T) => {
    onClick?: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
  };
  t?: Function;
}

export function Table<T>({
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  tableActionRef,
  columns,
  data,
  rowSelection,
  loading = false,
  bodyHeight,
  onRow,
  t,
}: TableProps<T>): ReactElement {
  const translate = useMemo(() => {
    return typeof t === "function" ? t : () => undefined;
  }, [t]);

  const tableHeaderRef = useRef<HTMLTableElement>(null);
  const tableFooterRef = useRef<HTMLTableElement>(null);

  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});

  // 不是当前页的选中全部
  const [isRowSelectedAll, setIsRowSelectedAll] = useState(false);

  const hasBulkActions = useMemo(() => {
    return (
      typeof rowSelection?.bulkActions !== "undefined" &&
      rowSelection.bulkActions([], false).length !== 0
    );
  }, [rowSelection]);

  const memoColumns = useMemo(() => {
    const cloneColumns = cloneDeep(columns);

    if (typeof rowSelection !== "undefined") {
      cloneColumns.unshift({
        id: "row-select",
        size: 40,
        maxSize: 40,
        pin: cloneColumns.some(
          (column) =>
            typeof column.pin !== "undefined" &&
            typeof column.pin !== "boolean" &&
            ["left", "right"].includes(column.pin)
        )
          ? "left"
          : undefined,
        header: !(rowSelection.single ?? false)
          ? ({ table }) => {
              return (
                <Checkbox
                  checked={
                    table.getIsAllRowsSelected()
                      ? true
                      : Object.keys(internalRowSelection).length > 0
                      ? "indeterminate"
                      : false
                  }
                  onCheckedChange={(value) => {
                    table.toggleAllRowsSelected(
                      [false, "indeterminate"].includes(value) ? false : true
                    );
                  }}
                />
              );
            }
          : undefined,
        cell: ({ row, table }) =>
          typeof rowSelection.single !== "undefined" && rowSelection.single ? (
            <RadioGroup
              value={row.getIsSelected() ? row.id : undefined}
              onValueChange={() => {
                table.setRowSelection({ [row.id]: true });
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <RadioGroupItem value={row.id} disabled={!row.getCanSelect()} />
            </RadioGroup>
          ) : (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onCheckedChange={row.getToggleSelectedHandler()}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          ),
      });
    }

    return cloneColumns.map((column) =>
      typeof column.id === "undefined"
        ? {
            ...column,
            id: (column as AccessorKeyColumnDef<T>).accessorKey,
          }
        : column
    );
  }, [columns, internalRowSelection, rowSelection]);

  const table = useReactTable({
    data,
    columns: memoColumns as Array<ColumnDef<T>>,
    state: {
      rowSelection: internalRowSelection,
      columnPinning: reduce(
        memoColumns.filter(
          (column) => typeof column.pin !== "undefined" && column.pin !== false
        ),
        (acc: Record<string, string[]>, column) => {
          if (
            (column.pin === "left" || column.pin === "right") &&
            !acc[column.pin]
          ) {
            acc[column.pin] = [];
          }

          acc[column.pin as keyof typeof column.pin].push(
            (column as AccessorKeyColumnDef<T>).id!
          );

          return acc;
        },
        {}
      ),
    },
    enableRowSelection: typeof rowSelection !== "undefined",
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: (updater) => {
      setInternalRowSelection((old) => {
        const newRowSelection =
          updater instanceof Function ? updater(old) : updater;

        rowSelection?.onSelectionChange?.(
          Object.keys(newRowSelection).map((key) => table.getRow(key).original)
        );

        setIsRowSelectedAll(false);

        return newRowSelection;
      });
    },
  });

  const columnsPinnedInfo = useMemo(() => {
    return groupBy(
      table.getHeaderGroups().map((headerGroup) =>
        headerGroup.headers
          .filter((header) => header.column.getIsPinned() !== false)
          .map((header) => ({
            direction: header.column.getIsPinned(),
            size: header.column.getSize(),
          }))
      )[0],
      "direction"
    );
  }, [table]);

  const getColumnPinedOffset = useCallback(
    (pinnedIndex: number, direction: "left" | "right") => {
      if (direction === "left") {
        return sum(
          columnsPinnedInfo.left.map((item) => item.size).slice(0, pinnedIndex)
        );
      }

      if (direction === "right") {
        return sum(
          columnsPinnedInfo.right
            .map((item) => item.size)
            .reverse()
            .slice(0, table.getRightLeafColumns().length - pinnedIndex - 1)
        );
      }
    },
    [columnsPinnedInfo, table]
  );

  // 一些可以手动触发的特殊操作
  useImperativeHandle(
    tableActionRef,
    () => ({
      resetRowSelection: () => {
        table.resetRowSelection();
      },
    }),
    [table]
  );

  return (
    <div
      className={cn(
        "relative min-w-full",
        loading && "pointer-events-none overflow-hidden select-none"
      )}
    >
      <div className="overflow-hidden" ref={tableHeaderRef}>
        <table className="w-full table-fixed">
          <thead className="relative border-b">
            {/* batch actions */}
            {!(rowSelection?.single ?? false) &&
              Object.keys(internalRowSelection).length > 0 &&
              hasBulkActions && (
                <tr className="absolute z-[2] flex w-full items-center space-x-2 bg-white px-3 py-2">
                  <td>
                    <Checkbox
                      checked={
                        table.getIsAllRowsSelected()
                          ? true
                          : Object.keys(internalRowSelection).length > 0
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={(value) => {
                        table.toggleAllRowsSelected(
                          [false, "indeterminate"].includes(value)
                            ? false
                            : true
                        );
                      }}
                    />
                  </td>

                  <td className="text-sm text-gray-500">
                    {isRowSelectedAll
                      ? translate(
                          "common:components.table.batchActions.selectedAll"
                        ) ?? "Selected all"
                      : translate(
                          "common:components.table.batchActions.selectedRows",
                          {
                            rows: Object.keys(internalRowSelection).length,
                          }
                        ) ??
                        `Selected ${
                          Object.keys(internalRowSelection).length
                        } rows`}
                  </td>

                  {typeof rowSelection?.allowSelectAll !== "undefined" &&
                    rowSelection.allowSelectAll && (
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            if (isRowSelectedAll) {
                              setIsRowSelectedAll(false);
                            } else {
                              table.toggleAllRowsSelected(true);

                              setTimeout(() => {
                                setIsRowSelectedAll(true);
                              });
                            }
                          }}
                        >
                          {isRowSelectedAll
                            ? translate(
                                "common:components.table.batchActions.cancel"
                              ) ?? "Cancel"
                            : translate(
                                "common:components.table.batchActions.selectAll"
                              ) ?? "Select all"}
                        </Button>
                      </td>
                    )}

                  <td className="ml-auto flex space-x-2">
                    {rowSelection
                      ?.bulkActions?.(
                        Object.keys(internalRowSelection).map(
                          (key) => table.getRow(key).original
                        ),
                        isRowSelectedAll
                      )
                      ?.map((action, index) => (
                        <div key={index}>
                          <Button
                            {...action}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          />
                        </div>
                      ))}
                  </td>
                </tr>
              )}

            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="relative" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      className={cn(
                        "bg-white px-3 py-3.5 text-left text-sm font-semibold whitespace-nowrap",
                        typeof (header.column.columnDef as TableColumnProps<T>)
                          ?.align !== "undefined" &&
                          columnAlignClass[
                            (header.column.columnDef as TableColumnProps<T>)
                              .align as keyof typeof columnAlignClass
                          ],
                        typeof (header.column.columnDef as TableColumnProps<T>)
                          ?.wordWrap !== "undefined" &&
                          columnWrapClass[
                            (header.column.columnDef as TableColumnProps<T>)
                              .wordWrap as unknown as keyof typeof columnWrapClass
                          ],
                        header.column.getIsPinned() !== false &&
                          "sticky z-[1] bg-white",
                        header.column.getIsPinned() === "left" &&
                          header.column.getPinnedIndex() ===
                            table.getLeftLeafColumns().length - 1 &&
                          "drop-shadow-[1px_0_0_#e5e7eb]",
                        header.column.getIsPinned() === "right" &&
                          header.column.getPinnedIndex() ===
                            table.getRightLeafColumns().length - 1 &&
                          "drop-shadow-[-1px_0_0_#e5e7eb]"
                      )}
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        left:
                          header.column.getIsPinned() === "left" &&
                          columnsPinnedInfo.left?.length > 0
                            ? getColumnPinedOffset(
                                header.column.getPinnedIndex(),
                                "left"
                              )
                            : undefined,
                        right:
                          header.column.getIsPinned() === "right" &&
                          columnsPinnedInfo.right?.length > 0
                            ? getColumnPinedOffset(
                                header.column.getPinnedIndex(),
                                "right"
                              )
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
        </table>
      </div>

      <div
        className={cn(
          typeof bodyHeight !== "undefined"
            ? "overflow-auto"
            : "overflow-y-hidden"
        )}
        style={{
          minHeight:
            typeof bodyHeight?.min !== "undefined"
              ? `${bodyHeight?.min}px`
              : undefined,
          maxHeight:
            typeof bodyHeight?.max !== "undefined"
              ? `${bodyHeight?.max}px`
              : undefined,
        }}
        onScroll={(e) => {
          const scrollLeft = (e.target as HTMLElement).scrollLeft;

          if (tableHeaderRef.current != null) {
            tableHeaderRef.current.scrollLeft = scrollLeft;
          }

          if (tableFooterRef.current != null) {
            tableFooterRef.current.scrollLeft = scrollLeft;
          }
        }}
      >
        <table className="w-full table-fixed">
          <tbody className="relative divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                className={cn(
                  "group bg-white hover:bg-gray-50",
                  onRow != null && "cursor-pointer"
                )}
                key={row.id}
                onClick={(e) => {
                  onRow?.(row.original)?.onClick?.(e);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    className={cn(
                      "bg-white px-3 py-4 text-sm break-words text-gray-500 group-hover:bg-gray-50",
                      typeof (cell.column.columnDef as TableColumnProps<T>)
                        ?.align !== "undefined" &&
                        columnAlignClass[
                          (cell.column.columnDef as TableColumnProps<T>)
                            .align as keyof typeof columnAlignClass
                        ],
                      typeof (cell.column.columnDef as TableColumnProps<T>)
                        ?.wordWrap !== "undefined" &&
                        columnWrapClass[
                          (cell.column.columnDef as TableColumnProps<T>)
                            .wordWrap as unknown as keyof typeof columnWrapClass
                        ],
                      cell.column.getIsPinned() !== false && "sticky z-[1]",
                      cell.column.getIsPinned() === "left" &&
                        cell.column.getPinnedIndex() ===
                          table.getLeftLeafColumns().length - 1 &&
                        "drop-shadow-[1px_0_0_#e5e7eb]",
                      cell.column.getIsPinned() === "right" &&
                        cell.column.getPinnedIndex() ===
                          table.getRightLeafColumns().length - 1 &&
                        "drop-shadow-[-1px_0_0_#e5e7eb]"
                    )}
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      left:
                        cell.column.getIsPinned() === "left" &&
                        columnsPinnedInfo.left?.length > 0
                          ? getColumnPinedOffset(
                              cell.column.getPinnedIndex(),
                              "left"
                            )
                          : undefined,
                      right:
                        cell.column.getIsPinned() === "right" &&
                        columnsPinnedInfo.right?.length > 0
                          ? getColumnPinedOffset(
                              cell.column.getPinnedIndex(),
                              "right"
                            )
                          : undefined,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <EmptyState
            className="py-10"
            description={emptyStateDescription}
            icon={emptyStateIcon}
            title={emptyStateTitle}
          />
        )}
      </div>

      {table.getAllColumns().filter((item) => item.columnDef?.footer).length >
        0 && (
        <div className="overflow-hidden" ref={tableFooterRef}>
          <table className="w-full table-fixed border-t">
            <tfoot className="relative">
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th
                      className={cn(
                        "bg-white px-3 py-4 text-sm break-words text-gray-500",
                        typeof (header.column.columnDef as TableColumnProps<T>)
                          ?.align !== "undefined"
                          ? columnAlignClass[
                              (header.column.columnDef as TableColumnProps<T>)
                                .align as keyof typeof columnAlignClass
                            ]
                          : columnAlignClass.left,
                        typeof (header.column.columnDef as TableColumnProps<T>)
                          ?.wordWrap !== "undefined" &&
                          columnWrapClass[
                            (header.column.columnDef as TableColumnProps<T>)
                              .wordWrap as unknown as keyof typeof columnWrapClass
                          ],
                        header.column.getIsPinned() !== false &&
                          "sticky z-[1] bg-white",
                        header.column.getIsPinned() === "left" &&
                          header.column.getPinnedIndex() ===
                            table.getLeftLeafColumns().length - 1 &&
                          "drop-shadow-[1px_0_0_#e5e7eb]",
                        header.column.getIsPinned() === "right" &&
                          header.column.getPinnedIndex() ===
                            table.getRightLeafColumns().length - 1 &&
                          "drop-shadow-[-1px_0_0_#e5e7eb]"
                      )}
                      key={header.id}
                      style={{
                        width: header.column.getSize(),
                        left:
                          header.column.getIsPinned() === "left" &&
                          columnsPinnedInfo.left?.length > 0
                            ? getColumnPinedOffset(
                                header.column.getPinnedIndex(),
                                "left"
                              )
                            : undefined,
                        right:
                          header.column.getIsPinned() === "right" &&
                          columnsPinnedInfo.right?.length > 0
                            ? getColumnPinedOffset(
                                header.column.getPinnedIndex(),
                                "right"
                              )
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          </table>
        </div>
      )}

      {loading && (
        <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
}

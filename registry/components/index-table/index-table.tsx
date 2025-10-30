"use client";

import {
  difference,
  isEmpty,
  isEqual,
  isNil,
  keys,
  omit,
  omitBy,
  pick,
  zipObject,
} from "lodash";
import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  type ParserBuilder,
  useQueryStates,
} from "nuqs";
import {
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Filter,
  type FilterItemProps,
  type FilterSearchConfig,
  FilterTypeValue,
} from "@/registry/components/filter/filter";
import { OrderDirectionList } from "@/registry/components/index-table/order-direction-list";
import { OrderDirection } from "@/registry/components/index-table/order-direction-list";
import { buildGraphqlQueryFromFilterValues } from "@/registry/components/index-table/utils/build-graphql-query-from-filter-values";
import {
  Table,
  type TableActionType,
  type TableColumnProps,
  type TableProps,
} from "@/registry/components/table/table";
import { View, ViewProps } from "@/registry/components/view/view";
import { Field } from "@/registry/types/field";

export interface IndexTableOrder<OrderField> {
  field: OrderField;
  direction: OrderDirection;
}

export interface IndexTableEdge<Node> {
  node: Node;
  cursor: string;
}

export interface IndexTablePageInfo {
  endCursor?: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
}

export interface IndexTablePagination {
  first?: number;
  last?: number;
  before?: string | null;
  after?: string | null;
}

export interface IndexTableValue<OrderField> extends IndexTablePagination {
  query?: string;
  orderBy?: IndexTableOrder<OrderField>;
}

export interface SaveViewConfig {
  filters?: Record<string, any>;
  query?: string;
}

export interface ActionType {
  reloadAndRest: () => void;
  setFilterValues: (
    filterValues: Record<string, any>,
    syncToUrl?: boolean,
  ) => void;
}

export interface ViewFormData {
  name: string;
}

export interface IndexTableProps<Node, OrderField> {
  emptyState?: {
    icon?: ReactNode;
    title?: string;
    description?: string;
  };
  rowSelection?: {
    single?: boolean;
    allowSelectAll?: boolean;
    onSelectionChange?: (rows: Node[]) => void;
    bulkActions?: (
      rows: Node[],
      isSelectedAll: boolean,
    ) => React.ComponentProps<"button">[];
  };
  bodyHeight?: {
    max?: number;
    min?: number;
  };
  actionRef?: RefObject<ActionType | null>;
  edges?: Array<IndexTableEdge<Node>>;
  filters?: Array<FilterItemProps<Node>>;
  search?: false | FilterSearchConfig;
  footer?: ReactNode;
  orderOptions?: {
    name: string;
    value: OrderField;
  }[];
  columns: Array<TableColumnProps<Node>>;
  pageSize?: number;
  pageInfo?: IndexTablePageInfo;
  loading?: boolean;
  value?: IndexTableValue<OrderField>;
  defaultFilterValue?: Record<Field<Node>, any>;
  viewConfig?: ViewProps & {
    onSave?: (viewKey: string, config: SaveViewConfig) => void;
  };
  toolBarRender?: () => ReactNode;
  onChange?: (value: IndexTableValue<OrderField>) => void;
  onRow?: TableProps<Node>["onRow"];
  t?: Function;
}

const getFilterFiledTypeParse = (
  type: FilterTypeValue,
  itemType?: FilterTypeValue,
): ParserBuilder<any> => {
  switch (type) {
    case String:
      return parseAsString;
    case Number:
      return parseAsInteger;
    case Boolean:
      return parseAsBoolean;
    case Date:
      return parseAsIsoDateTime;
    case Array:
      return parseAsArrayOf(
        typeof itemType === "undefined"
          ? parseAsString
          : itemType === Date
            ? (parseAsIsoDateTime as unknown as ParserBuilder<string>)
            : getFilterFiledTypeParse(itemType),
      );
    default:
      return parseAsString;
  }
};

export function IndexTable<Node, OrderField extends string>({
  actionRef,
  emptyState,
  defaultFilterValue,
  footer,
  filters = [],
  columns = [],
  search,
  bodyHeight,
  edges,
  orderOptions,
  pageSize = 10,
  pageInfo,
  loading = false,
  value = {},
  rowSelection,
  viewConfig,
  toolBarRender,
  onChange,
  onRow,
  t,
}: IndexTableProps<Node, OrderField>): ReactElement {
  const translate = useMemo(() => {
    return typeof t === "function" ? t : () => undefined;
  }, [t]);

  // 是否显示创建新视图的对话框
  const [showCreateViewDialog, setShowCreateViewDialog] = useState(false);
  // 创建新视图的表单
  const createViewForm = useForm<ViewFormData>({
    values: {
      name: "",
    },
  });

  // 当前进行过滤操作时选中的视图 key
  const currentSelectedViewKeyRef = useRef<string | undefined>(undefined);

  const [filterValues, setFilterValues] = useState<
    Record<Field<Node>, any> | undefined
  >(defaultFilterValue);

  const query = useMemo(() => {
    return buildGraphqlQueryFromFilterValues(filters, filterValues);
  }, [filterValues, filters]);

  const [pagination, setPagination] = useState<IndexTablePagination>(
    pick(value, ["first", "after", "last", "before"]),
  );

  const [orderField, setOrderField] = useState(value?.orderBy?.field);
  const [orderDirection, setOrderDirection] = useState(
    value?.orderBy?.direction,
  );

  // 是否启用视图
  const enabledView = useMemo(
    () => Boolean(viewConfig?.items?.length),
    [viewConfig],
  );

  const [urlQueryStates, setUrlQueryStates] = useQueryStates(
    {
      query: parseAsString,
      selectedView: parseAsString,
      ...filters.reduce<Record<string, ParserBuilder<any>>>(
        (result, currentFilter) => {
          result[currentFilter.field] =
            typeof currentFilter?.type === "undefined"
              ? parseAsString
              : getFilterFiledTypeParse(
                  currentFilter.type,
                  currentFilter.itemType,
                );

          return result;
        },
        {},
      ),
    },
    { history: "push" },
  );

  // nuqs 包对监听的属性值默认设置为 null（无论是否存在于 url 上），所以需要过滤掉 null 和 undefined 的 url 查询参数，供过滤组件使用
  const usefulQueryStates = useMemo(() => {
    return omitBy(urlQueryStates, isNil);
  }, [urlQueryStates]);

  // 处理 url 参数
  const transformedParams = useMemo(() => {
    // 如果启用视图，并且 url 不存在 selectedView 参数，则将 url 参数转换为对应的类型
    if (enabledView && typeof usefulQueryStates?.selectedView === "undefined") {
      return usefulQueryStates;
    }

    return filterValues;
  }, [enabledView, usefulQueryStates, filterValues]);

  const tableActionRef = useRef<TableActionType>(null);

  // 一些可以手动触发的特殊操作
  useImperativeHandle(
    actionRef,
    () => ({
      reloadAndRest: () => {
        setPagination({});
      },
      setFilterValues: async (
        filterValues: Record<Field<Node>, any>,
        syncToUrl = false,
      ) => {
        if (syncToUrl) {
          const needClearFields = difference(
            keys(transformedParams),
            keys(filterValues),
          );

          await setUrlQueryStates({
            ...filterValues,
            ...zipObject(
              needClearFields,
              Array(needClearFields.length).fill(null),
            ),
            selectedView: null,
          });
        } else {
          setFilterValues(filterValues);
        }
      },
    }),
    [setUrlQueryStates, transformedParams],
  );

  const handlePrevClick = useCallback(() => {
    setPagination({ last: pageSize, before: pageInfo?.startCursor });
  }, [pageSize, pageInfo?.startCursor]);

  const handleNextClick = useCallback(() => {
    setPagination({ first: pageSize, after: pageInfo?.endCursor });
  }, [pageSize, pageInfo?.endCursor]);

  const handleCreateView = useCallback(
    async ({ name }: ViewFormData) => {
      const config: SaveViewConfig = {};

      const omitQueryFilters = omit(filterValues, "query");

      if (typeof (filterValues as Record<string, any>)?.query !== "undefined") {
        config.query = (filterValues as Record<string, any>).query;
      }

      if (
        typeof omitQueryFilters !== "undefined" &&
        !isEmpty(omitQueryFilters)
      ) {
        config.filters = omitQueryFilters;
      }

      await viewConfig?.onAdd?.(name, config);

      createViewForm.reset();

      setShowCreateViewDialog(false);
      currentSelectedViewKeyRef.current = undefined;
    },
    [createViewForm, filterValues, viewConfig],
  );

  // 处理视图保存
  const handleViewSave = useCallback(async () => {
    const config: SaveViewConfig = {};

    const omitQueryFilters = omit(filterValues, "query");

    if (typeof (filterValues as Record<string, any>)?.query !== "undefined") {
      config.query = (filterValues as Record<string, any>).query;
    }

    if (typeof omitQueryFilters !== "undefined" && !isEmpty(omitQueryFilters)) {
      config.filters = omitQueryFilters;
    }

    if (typeof currentSelectedViewKeyRef.current !== "undefined") {
      if (
        typeof viewConfig !== "undefined" &&
        typeof viewConfig.items.find(
          (item) =>
            item.key === currentSelectedViewKeyRef.current &&
            item.canEdit !== false,
        ) !== "undefined"
      ) {
        await viewConfig?.onSave?.(currentSelectedViewKeyRef.current, config);

        currentSelectedViewKeyRef.current = undefined;
      } else {
        setShowCreateViewDialog(true);
      }
    } else {
      setShowCreateViewDialog(true);
    }
  }, [filterValues, viewConfig]);

  // 当启用视图并且 searchParams 发生变化的时候，更新 filterValues
  useEffect(() => {
    if (!isEqual(transformedParams, filterValues)) {
      setFilterValues(transformedParams as any);
      setPagination({});
    }
  }, [filterValues, transformedParams]);

  // 如果 url 不存在 selectedView 参数，则根据过滤项和查询条件来决定视图行为
  useEffect(() => {
    if (enabledView && typeof usefulQueryStates?.selectedView === "undefined") {
      if (
        !(
          filters.some(
            (item) => typeof usefulQueryStates?.[item.field] !== "undefined",
          ) || typeof usefulQueryStates?.query !== "undefined"
        )
      ) {
        // 没有符合的过滤项，则将视图参数设置为第一个视图
        const params = new URLSearchParams(window.location.search);

        const needClearFields = Array.from(params.keys());

        const url = new URL(window.location.href);

        needClearFields.forEach((key) => {
          url.searchParams.delete(key);
        });

        url.searchParams.set("selectedView", viewConfig!.items[0].key);

        window.history.pushState(null, "", url.toString());
      }
    }
  }, [enabledView, filters, usefulQueryStates, viewConfig]);

  // 当视图参数存在，但是视图参数不包含在配置项里面时，则将视图参数设置为第一个视图
  useEffect(() => {
    if (enabledView && typeof usefulQueryStates?.selectedView !== "undefined") {
      if (
        typeof viewConfig !== "undefined" &&
        !viewConfig.items.some(
          (item) => item.key === usefulQueryStates.selectedView,
        )
      ) {
        // 没有符合的过滤项，则将视图参数设置为第一个视图
        const params = new URLSearchParams(window.location.search);

        const needClearFields = Array.from(params.keys());

        const url = new URL(window.location.href);

        needClearFields.forEach((key) => {
          url.searchParams.delete(key);
        });

        url.searchParams.set("selectedView", viewConfig!.items[0].key);

        window.history.pushState(null, "", url.toString());
      }
    }
  }, [enabledView, viewConfig, usefulQueryStates]);

  // 当前视图以 url 为准，如果没有以本地为准
  useEffect(() => {
    if (
      enabledView &&
      urlQueryStates?.selectedView &&
      currentSelectedViewKeyRef
    ) {
      currentSelectedViewKeyRef.current = urlQueryStates?.selectedView;
    }
  }, [urlQueryStates?.selectedView, enabledView]);

  useEffect(() => {
    onChange?.({
      query,
      ...(Object.keys(pagination).length > 0
        ? pagination
        : { first: pageSize }),
      ...(typeof orderField !== "undefined"
        ? {
            orderBy: {
              field: orderField,
              direction: orderDirection ?? OrderDirection.ASC,
            },
          }
        : {}),
    });

    tableActionRef.current?.resetRowSelection?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, pagination, pageSize, orderField, orderDirection, tableActionRef]);

  return (
    <div className="overflow-hidden rounded-md border last-of-type:rounded-lg">
      <div className={cn(!!(filters.length || search) && "border-b")}>
        {typeof toolBarRender !== "undefined" && toolBarRender()}

        <div className="space-y-2 p-2">
          {enabledView && (
            <div className="mr-2 overflow-x-auto">
              <View
                {...viewConfig!}
                t={t}
                activeKey={currentSelectedViewKeyRef.current}
              />
            </div>
          )}

          <Filter<Node>
            t={t}
            extra={
              <>
                {typeof orderOptions !== "undefined" &&
                orderOptions.length > 0 ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <ArrowDownUp />
                            </Button>
                          </TooltipTrigger>

                          <TooltipContent>
                            {translate("turboost_ui.index_table.sort") ??
                              "Sort"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </PopoverTrigger>

                    <PopoverContent className="w-fit divide-y p-2 text-left">
                      <RadioGroup
                        className="pb-2"
                        value={orderField}
                        onValueChange={(value) => {
                          setPagination({});
                          setOrderField(value as OrderField);
                        }}
                      >
                        {orderOptions.map(({ name, value }) => (
                          <div className="flex items-center gap-2" key={value}>
                            <RadioGroupItem
                              key={name}
                              id={name}
                              value={value as OrderField}
                            />
                            <Label htmlFor={name}>{name}</Label>
                          </div>
                        ))}
                      </RadioGroup>

                      <OrderDirectionList
                        value={orderDirection}
                        onChange={(value) => {
                          setPagination({});
                          setOrderDirection(value);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                ) : undefined}

                {enabledView ? (
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!!urlQueryStates?.selectedView}
                      onClick={() => {
                        if (
                          (typeof currentSelectedViewKeyRef.current ===
                            "undefined" &&
                            typeof usefulQueryStates?.selectedView ===
                              "undefined") ||
                          currentSelectedViewKeyRef.current !==
                            usefulQueryStates?.selectedView
                        ) {
                          // 没有符合的过滤项，则将视图参数设置为第一个视图
                          const params = new URLSearchParams(
                            window.location.search,
                          );

                          const needClearFields = Array.from(params.keys());

                          const url = new URL(window.location.href);

                          needClearFields.forEach((key) => {
                            url.searchParams.delete(key);
                          });

                          url.searchParams.set(
                            "selectedView",
                            typeof currentSelectedViewKeyRef.current !==
                              "undefined"
                              ? currentSelectedViewKeyRef.current
                              : viewConfig!.items[0].key,
                          );

                          window.history.pushState(null, "", url.toString());

                          currentSelectedViewKeyRef.current = undefined;
                        } else {
                          setFilterValues(
                            typeof filterValues === "undefined"
                              ? undefined
                              : { ...filterValues },
                          );
                          currentSelectedViewKeyRef.current = undefined;
                        }
                      }}
                    >
                      {translate("turboost_ui.index_table.view.cancel") ??
                        "Cancel"}
                    </Button>
                    <Button
                      disabled={
                        typeof usefulQueryStates?.selectedView !== "undefined"
                      }
                      size="sm"
                      variant="ghost"
                      onClick={handleViewSave}
                    >
                      {viewConfig?.loading ? (
                        <Spinner />
                      ) : (
                        (translate("turboost_ui.index_table.view.save") ??
                        "Save")
                      )}
                    </Button>
                  </div>
                ) : undefined}
              </>
            }
            filters={filters}
            loading={loading}
            search={search}
            values={filterValues}
            onChange={(result) => {
              // 根据是否开启视图来决定如何更新过滤项
              if (enabledView) {
                if (!isEqual(result, transformedParams)) {
                  const needClearFields = difference(
                    keys(transformedParams),
                    keys(result),
                  );

                  setUrlQueryStates(
                    isEmpty(result)
                      ? {
                          ...zipObject(
                            needClearFields,
                            Array(needClearFields.length).fill(null),
                          ),
                          selectedView:
                            typeof currentSelectedViewKeyRef.current !==
                            "undefined"
                              ? currentSelectedViewKeyRef.current
                              : viewConfig!.items[0].key,
                        }
                      : {
                          ...result,
                          ...zipObject(
                            needClearFields,
                            Array(needClearFields.length).fill(null),
                          ),
                          selectedView: null,
                        },
                  );
                }
              } else {
                setFilterValues(result);
                setPagination({});
              }
            }}
          />
        </div>
      </div>

      <div
        className={cn("relative min-h-20", loading && "pointer-events-none")}
      >
        {typeof edges !== "undefined" && edges.length > 0 ? (
          <Table
            bodyHeight={bodyHeight}
            columns={columns}
            data={edges.map((edge) => edge.node)}
            rowSelection={rowSelection}
            tableActionRef={tableActionRef}
            onRow={onRow}
          />
        ) : !loading ? (
          <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
            <EmptyHeader>
              {emptyState?.icon && (
                <EmptyMedia variant="icon">{emptyState.icon}</EmptyMedia>
              )}

              {emptyState?.title && <EmptyTitle>{emptyState.title}</EmptyTitle>}

              {emptyState?.description && (
                <EmptyDescription>{emptyState.description}</EmptyDescription>
              )}
            </EmptyHeader>
          </Empty>
        ) : undefined}

        {/* 当获取新数据的时候，加载状态可以覆盖在老数据上面 */}
        {loading && (
          <>
            <div className="bg-background absolute top-0 left-0 z-[2] h-full w-full opacity-50" />
            <Spinner className="absolute top-0 right-0 bottom-0 left-0 z-10 m-auto" />
          </>
        )}
      </div>

      {footer !== undefined && <div>{footer}</div>}

      {(pageInfo?.hasPreviousPage === true ||
        pageInfo?.hasNextPage === true) && (
        <div className="flex justify-center gap-2 border-t p-2">
          <Button
            disabled={!pageInfo?.hasPreviousPage || loading}
            variant="ghost"
            onClick={handlePrevClick}
          >
            <ChevronLeft />
          </Button>

          <Button
            disabled={!pageInfo?.hasNextPage || loading}
            variant="ghost"
            onClick={handleNextClick}
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      <Dialog
        open={showCreateViewDialog}
        onOpenChange={setShowCreateViewDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {translate("turboost_ui.index_table.view.create_dialog.title") ??
                "Create View"}
            </DialogTitle>
          </DialogHeader>

          <Form {...createViewForm}>
            <form
              className="space-y-4"
              onSubmit={createViewForm.handleSubmit(handleCreateView)}
            >
              <FormField
                name="name"
                rules={{
                  required:
                    translate(
                      "turboost_ui.index_table.view.create_dialog.form.name_field.rule.required",
                    ) ?? "View name is required",
                }}
                control={createViewForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {translate(
                        "turboost_ui.index_table.view.create_dialog.form.name_field.label",
                      ) ?? "View Name"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={
                          translate(
                            "turboost_ui.index_table.view.create_dialog.form.name_field.placeholder",
                          ) ?? "Please enter view name"
                        }
                        maxLength={40}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {viewConfig?.loading ? (
                    <Spinner />
                  ) : (
                    (translate(
                      "turboost_ui.index_table.view.create_dialog.form.submit_btn.content",
                    ) ?? "Save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

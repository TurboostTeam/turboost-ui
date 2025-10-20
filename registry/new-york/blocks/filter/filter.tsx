import dayjs from "dayjs";
import { forEach, isPlainObject, omitBy, transform } from "lodash";
import { ChevronDown, Loader2, Plus, Search, X } from "lucide-react";
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { type Field } from "@/registry/new-york/types/field";
import { Badge } from "@/registry/new-york/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";
import { Input } from "@/registry/new-york/blocks/input/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover";

const isEmpty = (value: unknown): boolean => {
  return (
    typeof value === "undefined" ||
    value === "" ||
    (value instanceof Array && value.length === 0)
  );
};

const omitEmpty = (obj: any): any => omitBy(obj, isEmpty);

const formatRenderValue = (obj: any): any => {
  return transform<any, any>(
    obj,
    (result, value, key) => {
      if (isPlainObject(value) || Array.isArray(value)) {
        forEach(formatRenderValue(value), (flattenedValue, flattenedKey) => {
          if (Array.isArray(value)) {
            if (typeof result[key] === "undefined") {
              result[key] = [];
            }
          } else {
            if (typeof result[key] === "undefined") {
              result[key] = {};
            }
          }

          result[key][flattenedKey] =
            flattenedValue instanceof Date
              ? dayjs(flattenedValue).format("YYYY-MM-DD")
              : flattenedValue;
        });
      } else {
        result[key] =
          value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
      }
    },
    {}
  );
};

const flattenObject = (obj: any): any => {
  return transform<any, any>(
    obj,
    (result, value, key) => {
      if (typeof key === "string" && isPlainObject(value)) {
        const nested = flattenObject(value);
        forEach(nested, (nestedValue, nestedKey) => {
          result[`${key}.${nestedKey}`] = nestedValue;
        });
      } else {
        result[key] = value;
      }
    },
    {}
  );
};

export type FilterTypeValue =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | ArrayConstructor;

export interface FilterItemProps<T> {
  label: string;
  field: Field<T>;
  render: ({
    field: { value, onChange },
  }: {
    field: {
      value: any;
      onChange: (value: any) => void;
    };
  }) => ReactElement;
  renderValue?: (options: {
    label: string;
    field: Field<T>;
    value: any;
  }) => ReactNode;
  pinned?: boolean;
  type?: FilterTypeValue;
  itemType?: FilterTypeValue;
}

export interface FilterSearchConfig {
  querySuffix?: ReactNode;
  queryPrefix?: ReactNode;
  queryPlaceholder?: string;
  disabled?: boolean;
}

export interface FilterProps<T> {
  className?: string;
  loading?: boolean;
  filters?: Array<FilterItemProps<T>>;
  extra?: ReactNode;
  search?: false | FilterSearchConfig;
  values?: Record<Field<T>, any> & { query?: string };
  onChange?: (value: Record<Field<T>, any> & { query?: string }) => void;
  t?: Function;
}

export function Filter<T>({
  className,
  loading = false,
  filters = [],
  extra,
  search,
  values,
  onChange,
  t,
}: FilterProps<T>): ReactElement {
  const translate = useMemo(() => {
    return typeof t === "function" ? t : () => undefined;
  }, [t]);

  const { control, setValue, watch, reset } = useForm<any>({
    defaultValues: {
      query: "",
    },
  });

  // 将筛选条件分组为固定和非固定两类
  const [{ fixedFilters, unfixedFilters }, setFilterGroups] = useState({
    fixedFilters: filters.filter((item) => item.pinned),
    unfixedFilters: filters.filter((item) => item.pinned !== true),
  });

  const handleChange = useCallback(() => {
    onChange?.(omitEmpty(flattenObject(watch())));
  }, [onChange, watch]);

  // 设置筛选条件固定状态
  const setFilterFieldPinnedStatus = useCallback(
    (field: Field<T>, pinned: boolean) => {
      setFilterGroups((prev) => {
        return {
          ...prev,
          fixedFilters: pinned
            ? [
                ...prev.fixedFilters,
                ...prev.unfixedFilters
                  .filter((item) => item.field === field)
                  .map((item) => ({ ...item, pinned })),
              ]
            : prev.fixedFilters.filter((item) => item.field !== field),
          unfixedFilters: pinned
            ? prev.unfixedFilters.filter((item) => item.field !== field)
            : [
                ...prev.unfixedFilters,
                ...prev.fixedFilters
                  .filter((item) => item.field === field)
                  .map((item) => ({ ...item, pinned })),
              ],
        };
      });
    },
    []
  );

  useEffect(() => {
    // 获取当前表单中所有字段的值
    const currentFormValues = watch();
    // 准备新的表单值
    const newFormValues = { ...currentFormValues };

    // 将所有在 watch() 中但不在 values 中的字段设置为 undefined
    Object.keys(currentFormValues).forEach((key) => {
      if (
        typeof values !== "undefined" &&
        !Object.prototype.hasOwnProperty.call(values, key)
      ) {
        newFormValues[key] = undefined;
      }
    });

    // 将 values 中的值应用到表单
    if (typeof values !== "undefined") {
      Object.keys(values).forEach((key) => {
        newFormValues[key as keyof typeof values] =
          values[key as keyof typeof values];
      });
    }

    // 重置表单，应用新的值
    reset(newFormValues);
  }, [values, watch, reset]);

  return (
    <div className={cn("flex-1 space-y-3", className)}>
      {!(
        (typeof search === "undefined" || search === false) &&
        typeof extra === "undefined"
      ) && (
        <div className="flex items-center gap-2">
          {typeof search !== "undefined" && search !== false && (
            <Controller<{ query: string }>
              control={control}
              name="query"
              render={({ field }) => (
                <Input
                  disabled={field?.disabled ?? search?.disabled}
                  placeholder={search?.queryPlaceholder}
                  prefix={search?.queryPrefix ?? <Search className="size-4" />}
                  suffix={
                    loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      search?.querySuffix
                    )
                  }
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && typeof search !== "undefined") {
                      e.preventDefault();
                      handleChange();
                    }
                  }}
                />
              )}
            />
          )}

          {extra}
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fixedFilters.map(({ field, label, render, renderValue }) => {
            const originalFilter = filters.find((item) => item.field === field);
            const fieldValue = watch(field);

            return (
              <Popover
                // Dialog -> Popover -> ScrollArea 时会有滚动问题，需要加 modal={true}
                // issue:https://github.com/shadcn-ui/ui/issues/922
                modal={true}
                defaultOpen={originalFilter?.pinned !== true}
                onOpenChange={(open) => {
                  // 关闭筛选弹窗的时候如果该筛选条件没有值，则将其移除固定项
                  if (
                    !open &&
                    typeof fieldValue === "undefined" &&
                    originalFilter?.pinned !== true
                  ) {
                    setFilterFieldPinnedStatus(field, false);
                  }
                }}
                key={field}
              >
                <PopoverTrigger asChild className="whitespace-normal">
                  <Badge
                    variant="outline"
                    className="hover:bg-accent rounded-full px-2 py-1"
                  >
                    <span className="flex items-center gap-1">
                      {isEmpty(fieldValue) ? (
                        <>
                          <span>{label}</span>{" "}
                          <ChevronDown className="size-4" />
                        </>
                      ) : (
                        <>
                          <span>
                            {`${label}: ${String(
                              typeof renderValue !== "undefined"
                                ? renderValue({
                                    field,
                                    label,
                                    value: formatRenderValue({
                                      [field]: fieldValue,
                                    })[field],
                                  })
                                : formatRenderValue({ [field]: fieldValue })[
                                    field
                                  ]
                            )}`}
                          </span>

                          <X
                            className="size-4 shrink-0 cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              close();
                              setValue(field, undefined as any);

                              // 如果该筛选条件是非原固定筛选条件，则将其移除
                              if (originalFilter?.pinned !== true) {
                                setFilterFieldPinnedStatus(field, false);
                              }

                              handleChange();
                            }}
                          />
                        </>
                      )}
                    </span>
                  </Badge>
                </PopoverTrigger>

                <PopoverContent className="w-fit">
                  <Controller
                    control={control}
                    name={field}
                    render={(renderProps) =>
                      render({
                        ...renderProps,
                        field: {
                          ...renderProps.field,
                          onChange: (value) => {
                            renderProps.field.onChange(value);
                            handleChange();
                          },
                        },
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            );
          })}

          {unfixedFilters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="outline"
                  className="hover:bg-accent rounded-full px-2 py-1"
                >
                  <span>{translate("turboost_ui.filters.add_filter")}</span>
                  <Plus className="size-4 shrink-0" />
                </Badge>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                {unfixedFilters.map(({ field, label }) => {
                  return (
                    <DropdownMenuItem
                      key={field}
                      onClick={() => {
                        setFilterFieldPinnedStatus(field, true);
                      }}
                    >
                      <div className="w-full text-center text-xs font-semibold">
                        {label}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}

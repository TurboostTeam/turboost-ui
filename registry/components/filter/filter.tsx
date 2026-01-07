import dayjs from "dayjs";
import { forEach, isPlainObject, omitBy, transform } from "lodash";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

const isEmpty = (value: unknown): boolean => {
  return (
    typeof value === "undefined" ||
    value === "" ||
    (value instanceof Array && value.length === 0)
  );
};

const omitEmpty = (obj: FilterValues): FilterValues => omitBy(obj, isEmpty);

const formatRenderValue = (obj: FilterValues): FilterValues => {
  return transform<FilterValues, FilterValues>(
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
    {},
  );
};

const flattenObject = (obj: FilterValues): FilterValues => {
  return transform<FilterValues, FilterValues>(
    obj,
    (result, value, key) => {
      if (isPlainObject(value)) {
        const nested = flattenObject(value);
        forEach(nested, (nestedValue, nestedKey) => {
          result[`${key}.${nestedKey}`] = nestedValue;
        });
      } else {
        result[key] = value;
      }
    },
    {},
  );
};

export interface FilterItemProps {
  label: string;
  field: string;
  icon?: ReactNode;
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
    field: string;
    value: any;
  }) => ReactNode;
  pinned?: boolean;
}

export interface FilterSearchConfig {
  value?: string;
  // 搜索框左侧扩展内容
  leading?: ReactNode;
  // 搜索框右侧扩展内容
  trailing?: ReactNode;
  suffix?: ReactNode;
  prefix?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

export interface FilterI18n {
  addFilter?: string;
}

export type FilterValues = Record<string, any>;

export interface FilterRenderers {
  addFilter?: () => ReactNode;
  filterItem?: (props: {
    label: string;
    field: string;
    icon?: ReactNode;
    value: string | undefined;
    remove: () => void;
  }) => ReactNode;
}

export interface FilterProps {
  className?: string;
  loading?: boolean;
  filters: Array<FilterItemProps>;
  search?: false | FilterSearchConfig;
  values?: FilterValues;
  renderers?: FilterRenderers;
  i18n?: FilterI18n;
  onChange?: (values: FilterValues) => void;
}

export function Filter({
  className,
  loading = false,
  filters,
  search,
  values,
  i18n,
  renderers,
  onChange,
}: FilterProps): ReactElement {
  const form = useForm({
    defaultValues: {
      query: "",
      filter: {},
    },
  });

  // 将筛选条件分组为固定和非固定两类
  const [{ fixedFilters, unfixedFilters }, setFilterGroups] = useState({
    fixedFilters: filters.filter((item) => item.pinned),
    unfixedFilters: filters.filter((item) => item.pinned !== true),
  });

  const handleFiltersChange = useCallback(() => {
    onChange?.(omitEmpty(flattenObject(form.state.values.filter)));
  }, [onChange, form]);

  // 设置筛选条件固定状态
  const setFilterFieldPinnedStatus = useCallback(
    (field: string, pinned: boolean) => {
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
    [],
  );

  useEffect(() => {
    form.setFieldValue("filter", values || {});
  }, [values, form]);

  // 如果 search 有 value 属性，则将 value 应用到表单
  useEffect(() => {
    if (search && "value" in search && typeof search.value === "string") {
      form.setFieldValue("query", search.value);
    }
  }, [search, form]);

  return (
    <div className={cn("space-y-3", className)}>
      {typeof search !== "undefined" && search !== false && (
        <div className="flex items-center gap-2">
          {search?.leading}

          <form.Field
            name="query"
            children={({ state: { value }, handleChange, handleBlur }) => (
              <InputGroup className={search?.className}>
                <InputGroupInput
                  value={value}
                  onChange={(e) => {
                    handleChange(e.target.value);
                  }}
                  onBlur={handleBlur}
                  placeholder={search?.placeholder}
                  disabled={search?.disabled}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      search?.onChange?.(value);
                    }
                  }}
                />
                <InputGroupAddon>
                  {search?.prefix ?? <Search />}
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  {loading ? <Spinner /> : search?.suffix}
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          {search?.trailing}
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fixedFilters.map(({ field, label, icon, render, renderValue }) => {
            const originalFilter = filters.find((item) => item.field === field);
            const fieldValue = form.getFieldValue(`filter.${field}`);

            // 获取筛选条件的值
            const getValue = (): string | undefined => {
              if (isEmpty(fieldValue)) {
                return undefined;
              } else {
                return String(
                  typeof renderValue !== "undefined"
                    ? renderValue({
                        field,
                        label,
                        value: formatRenderValue({
                          [field]: fieldValue,
                        })[field],
                      })
                    : formatRenderValue({
                        [field]: fieldValue,
                      })[field],
                );
              }
            };

            // 移除筛选条件
            const remove = () => {
              form.setFieldValue(`filter.${field}`, undefined);
              close();

              // 如果该筛选条件是非原固定筛选条件，则将其移除
              if (originalFilter?.pinned !== true) {
                setFilterFieldPinnedStatus(field, false);
              }

              handleFiltersChange();
            };

            const value = getValue();

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
                  {typeof renderers?.filterItem !== "undefined" ? (
                    renderers?.filterItem({
                      label,
                      icon,
                      field,
                      value,
                      remove,
                    })
                  ) : (
                    <Badge
                      variant="outline"
                      className="hover:bg-accent rounded-full px-2 py-1"
                    >
                      <div className="flex items-center gap-1">
                        <span>
                          {value ? `${label}: ${value}` : `${label}`}{" "}
                        </span>

                        {!value && <ChevronDown className="size-4" />}

                        {value && (
                          <X
                            className="size-4 shrink-0 cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              remove();
                            }}
                          />
                        )}
                      </div>
                    </Badge>
                  )}
                </PopoverTrigger>

                <PopoverContent className="w-fit">
                  <form.Field
                    name={`filter.${field}`}
                    children={({ state: { value }, handleChange: onChange }) =>
                      render({
                        field: {
                          value,
                          onChange: (value) => {
                            onChange(value);
                            handleFiltersChange();
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
                {typeof renderers?.addFilter !== "undefined" ? (
                  renderers?.addFilter()
                ) : (
                  <Badge
                    variant="outline"
                    className="hover:bg-accent rounded-full px-2 py-1"
                  >
                    <span>{i18n?.addFilter ?? "Add Filter"}</span>
                    <Plus className="size-4 shrink-0" />
                  </Badge>
                )}
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

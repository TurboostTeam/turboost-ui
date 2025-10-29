import { FC, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export enum ComplexFilterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  DATE = "date",
  DATETIME = "datetime",
}

export enum ComplexFilterLogical {
  AND = "$and",
  OR = "$or",
}

export type ComplexFilterEqualityOperator = "$eq" | "$ne";

export type ComplexFilterComparisonOperator = "$gt" | "$gte" | "$lt" | "$lte";

export type ComplexFilterLikeOperator = "$like" | "$nlike";

export type ComplexFilterMembershipOperator = "$in" | "$nin";

export type ComplexFilterOperator =
  | ComplexFilterEqualityOperator
  | ComplexFilterComparisonOperator
  | ComplexFilterLikeOperator
  | ComplexFilterMembershipOperator;

export type ComplexFilterCondition = Record<
  string,
  Partial<Record<ComplexFilterOperator, any>>
>;

export type ComplexFilterGroupValue = {
  [K in ComplexFilterLogical]?: ComplexFilterValue[];
};

export type ComplexFilterValue =
  | ComplexFilterGroupValue
  | ComplexFilterCondition;

const filterOperators: Record<ComplexFilterType, ComplexFilterOperator[]> = {
  [ComplexFilterType.STRING]: ["$eq", "$ne", "$like", "$nlike"],
  [ComplexFilterType.NUMBER]: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
  [ComplexFilterType.BOOLEAN]: ["$eq", "$ne"],
  [ComplexFilterType.DATE]: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
  [ComplexFilterType.DATETIME]: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
};

export interface ComplexFilterItem {
  type: ComplexFilterType;
  label: string;
  field: string;
  operators?: ComplexFilterOperator[];
}

export interface ComplexFilterI18n {
  operators: Record<ComplexFilterOperator, string>;
  logicals: Record<ComplexFilterLogical, string>;
  addCondition: string;
  addGroup: string;
  selectField: string;
  selectOperator: string;
  selectValue: string;
  clearAll: string;
}

export const defaultComplexFilterI18n: ComplexFilterI18n = {
  operators: {
    $eq: "等于",
    $ne: "不等于",
    $gt: "大于",
    $gte: "大于等于",
    $lt: "小于",
    $lte: "小于等于",
    $like: "包含",
    $nlike: "不包含",
    $in: "存在选项属于",
    $nin: "存在选项均不属于",
  },
  logicals: {
    $and: "且",
    $or: "或",
  },
  addCondition: "添加筛选条件",
  addGroup: "添加筛选条件组",
  selectField: "请选择筛选项",
  selectOperator: "运算符",
  selectValue: "请选择目标值",
  clearAll: "清空全部条件",
};

function isFilterGroup(
  value: ComplexFilterValue
): value is ComplexFilterGroupValue {
  return (
    value !== null &&
    typeof value === "object" &&
    (ComplexFilterLogical.AND in value || ComplexFilterLogical.OR in value)
  );
}

export interface ComplexFilterConditionRowProps {
  i18n: ComplexFilterI18n;
  filters: ComplexFilterItem[];
  value: ComplexFilterCondition;
  onChange: (value: ComplexFilterCondition) => void;
  onRemove: () => void;
}

export const ComplexFilterConditionRow: FC<ComplexFilterConditionRowProps> = ({
  i18n,
  filters,
  value,
  onChange,
  onRemove,
}) => {
  const [field, operatorValuePair] = useMemo<
    [
      string | undefined,
      Partial<Record<ComplexFilterOperator, any>> | undefined
    ]
  >(() => {
    const entries = Object.entries(value);
    if (entries.length === 0) return [undefined, undefined];
    return [entries[0][0], entries[0][1]];
  }, [value]);

  const [operator, targetValue] = useMemo<
    [ComplexFilterOperator | undefined, any]
  >(() => {
    if (!operatorValuePair) return [undefined, undefined];
    const entries = Object.entries(operatorValuePair);
    if (entries.length === 0) return [undefined, undefined];
    return [entries[0][0] as ComplexFilterOperator, entries[0][1]];
  }, [operatorValuePair]);

  const selectedFilter = useMemo(
    () => filters.find((filter) => filter.field === field),
    [filters, field]
  );

  const operators = useMemo(() => {
    return selectedFilter
      ? selectedFilter.operators ?? filterOperators[selectedFilter.type]
      : [];
  }, [selectedFilter]);

  const handleFieldChange = (newField: string) => {
    onChange({ [newField]: {} });
  };

  const handleOperatorChange = (newOperator: ComplexFilterOperator) => {
    if (!field) return;
    onChange({ [field]: { [newOperator]: targetValue ?? "" } });
  };

  const handleValueChange = (newValue: any) => {
    if (!field || !operator) return;
    onChange({ [field]: { [operator]: newValue } });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={field} onValueChange={handleFieldChange}>
        <SelectTrigger className="min-w-[200px]">
          <SelectValue placeholder={i18n.selectField} />
        </SelectTrigger>
        <SelectContent>
          {filters.map((filter) => (
            <SelectItem key={filter.field} value={filter.field}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={operator}
        onValueChange={handleOperatorChange}
        disabled={!selectedFilter}
      >
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder={i18n.selectOperator} />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op}>
              {i18n.operators[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        className="min-w-[200px]"
        placeholder={i18n.selectValue}
        value={targetValue ?? ""}
        onChange={(e) => handleValueChange(e.target.value)}
        disabled={!operator}
        type={
          selectedFilter?.type === ComplexFilterType.NUMBER ? "number" : "text"
        }
      />

      <Button variant="ghost" size="icon" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export interface ComplexFilterGroupProps {
  i18n: ComplexFilterI18n;
  filters: ComplexFilterItem[];
  value: ComplexFilterGroupValue;
  onChange: (value: ComplexFilterGroupValue) => void;
  onRemove?: () => void;
  depth?: number;
}

export const ComplexFilterGroup: FC<ComplexFilterGroupProps> = ({
  i18n,
  filters,
  value,
  onChange,
  onRemove,
  depth = 0,
}) => {
  const [logical, items]: [ComplexFilterLogical, ComplexFilterValue[]] =
    useMemo(() => {
      if (
        ComplexFilterLogical.AND in value &&
        value[ComplexFilterLogical.AND]
      ) {
        return [ComplexFilterLogical.AND, value[ComplexFilterLogical.AND]];
      }
      if (ComplexFilterLogical.OR in value && value[ComplexFilterLogical.OR]) {
        return [ComplexFilterLogical.OR, value[ComplexFilterLogical.OR]];
      }
      return [ComplexFilterLogical.AND, []];
    }, [value]);

  const handleLogicalChange = (newLogical: ComplexFilterLogical) => {
    onChange({ [newLogical]: items });
  };

  const handleItemChange = (index: number, newItem: ComplexFilterValue) => {
    const newItems = [...items];
    newItems[index] = newItem;
    onChange({ [logical]: newItems });
  };

  const handleItemRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    if (newItems.length === 0 && onRemove) {
      onRemove();
    } else {
      onChange({ [logical]: newItems });
    }
  };

  const handleAddCondition = () => {
    onChange({ [logical]: [...items, {}] });
  };

  const handleAddGroup = () => {
    onChange({
      [logical]: [...items, { [ComplexFilterLogical.AND]: [] }],
    });
  };

  return (
    <div className="flex gap-2">
      <div className="bg-background rounded-lg border p-4">
        <div className="flex gap-2">
          {/* 左侧大括号连接线 + 逻辑运算符按钮 */}
          {items.length > 1 && (
            <div className="flex flex-col w-10 pl-4 py-4">
              {/* 上半部分 - 顶部圆角 + 垂直线 */}
              <div className="border-l-2 border-t-2 border-border rounded-tl-md w-full flex-1" />

              {/* 逻辑运算符按钮 - 居中放置 */}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs -translate-x-1/2"
                onClick={() => {
                  const newLogical =
                    logical === ComplexFilterLogical.AND
                      ? ComplexFilterLogical.OR
                      : ComplexFilterLogical.AND;
                  handleLogicalChange(newLogical);
                }}
              >
                {i18n.logicals[logical]}
              </Button>

              {/* 下半部分 - 垂直线 + 底部圆角 */}
              <div
                className="border-l-2 border-b-2 border-border rounded-bl-md w-full flex-1"
                style={{ height: "calc(50% - 18px)" }}
              />
            </div>
          )}

          {/* 右侧条件列表 */}
          <div className="flex-1 space-y-3">
            {items.map((item, index) => (
              <div key={index}>
                {isFilterGroup(item) ? (
                  <ComplexFilterGroup
                    i18n={i18n}
                    filters={filters}
                    value={item}
                    onChange={(newValue) => handleItemChange(index, newValue)}
                    onRemove={() => handleItemRemove(index)}
                    depth={depth + 1}
                  />
                ) : (
                  <ComplexFilterConditionRow
                    i18n={i18n}
                    filters={filters}
                    value={item}
                    onChange={(newValue) => handleItemChange(index, newValue)}
                    onRemove={() => handleItemRemove(index)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={cn("flex gap-2 mt-4", items.length > 0 && "ml-12")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                {i18n.addCondition}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleAddCondition}>
                {i18n.addCondition}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddGroup}>
                {i18n.addGroup}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {onRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export interface ComplexFilterProps {
  filters: ComplexFilterItem[];
  i18n?: ComplexFilterI18n;
  value?: ComplexFilterValue;
  onChange?: (value: ComplexFilterValue) => void;
}

export const ComplexFilter: FC<ComplexFilterProps> = ({
  i18n = defaultComplexFilterI18n,
  filters,
  value,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState<ComplexFilterValue>({
    [ComplexFilterLogical.AND]: [],
  });

  const currentValue = value ?? internalValue;
  const handleChange = onChange ?? setInternalValue;

  const handleClearAll = () => {
    handleChange({ [ComplexFilterLogical.AND]: [] });
  };

  if (isFilterGroup(currentValue)) {
    return (
      <div className="space-y-4">
        <ComplexFilterGroup
          i18n={i18n}
          filters={filters}
          value={currentValue}
          onChange={handleChange}
        />
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            {i18n.clearAll}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

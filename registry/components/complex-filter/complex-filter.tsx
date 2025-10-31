"use client";

import { ChevronDown, Plus, X } from "lucide-react";
import { FC, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { NumberInput } from "@/registry/components/number-input/number-input";
import { DateInput } from "@/registry/components/date-input/date-input";

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

export type ComplexFilterValueFormat = "object" | "string";

/**
 * 根据 valueFormat 映射到对应的值类型
 */
export type ComplexFilterValueByFormat<T extends ComplexFilterValueFormat> =
  T extends "string" ? string : ComplexFilterValue;

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
    $eq: "Equal",
    $ne: "Not equal",
    $gt: "Greater than",
    $gte: "Greater than or equal",
    $lt: "Less than",
    $lte: "Less than or equal",
    $like: "Contains",
    $nlike: "Not contains",
    $in: "Includes",
    $nin: "Excludes",
  },
  logicals: {
    $and: "AND",
    $or: "OR",
  },
  addCondition: "Add condition",
  addGroup: "Add group",
  selectField: "Select field",
  selectOperator: "Select operator",
  selectValue: "Select value",
  clearAll: "Clear all",
};

function isFilterGroup(
  value: ComplexFilterValue,
): value is ComplexFilterGroupValue {
  return (
    value !== null &&
    typeof value === "object" &&
    (ComplexFilterLogical.AND in value || ComplexFilterLogical.OR in value)
  );
}

function cleanFilterValue(
  value: ComplexFilterValue,
): ComplexFilterValue | undefined {
  if (isFilterGroup(value)) {
    const logical =
      ComplexFilterLogical.AND in value
        ? ComplexFilterLogical.AND
        : ComplexFilterLogical.OR;
    const items = value[logical];

    if (!items) return undefined;

    const cleanedItems = items
      .map((item) => cleanFilterValue(item))
      .filter((item): item is ComplexFilterValue => item !== undefined);

    if (cleanedItems.length === 0) return undefined;

    return { [logical]: cleanedItems };
  } else {
    // 检查条件是否有效（有字段、运算符和值）
    const entries = Object.entries(value);
    if (entries.length === 0) return undefined;

    const [, operatorValuePair] = entries[0];
    if (!operatorValuePair || Object.keys(operatorValuePair).length === 0) {
      return undefined;
    }

    // 检查运算符是否有对应的值
    const operatorEntries = Object.entries(operatorValuePair);
    const hasValidValue = operatorEntries.some(([, val]) => {
      // 值不能是 undefined 或 null（对于数字，0 和空字符串是有效的）
      return val !== undefined && val !== null && val !== "";
    });

    if (!hasValidValue) {
      return undefined;
    }

    return value;
  }
}

/**
 * 将运算符转换为 Shopify 搜索语法格式
 */
function operatorToString(operator: ComplexFilterOperator): string {
  const operatorMap: Record<ComplexFilterOperator, string> = {
    $eq: ":",
    $ne: ":-",
    $gt: ":>",
    $gte: ":>=",
    $lt: ":<",
    $lte: ":<=",
    $like: ":",
    $nlike: ":-",
    $in: ":",
    $nin: ":-",
  };
  return operatorMap[operator] || ":";
}

/**
 * 将 ComplexFilterValue 对象转换为 Shopify 搜索语法格式的字符串
 * 例如: { name: { $eq: "Joe" } } 转换为 "name:Joe"
 * 例如: { age: { $gt: 18 } } 转换为 "age:>18"
 * 参考: https://shopify.dev/docs/api/usage/search-syntax
 */
export function filterValueToString(
  value: ComplexFilterValue,
  isNested = false,
): string {
  if (isFilterGroup(value)) {
    const logical =
      ComplexFilterLogical.AND in value
        ? ComplexFilterLogical.AND
        : ComplexFilterLogical.OR;
    const items = value[logical];

    if (!items || items.length === 0) return "";

    const logicalStr = logical === ComplexFilterLogical.AND ? "AND" : "OR";

    const itemStrings = items
      .map((item) => {
        // 递归调用时标记为嵌套
        if (isFilterGroup(item)) {
          return filterValueToString(item, true);
        }
        return filterValueToString(item, false);
      })
      .filter((s) => s !== "");

    if (itemStrings.length === 0) return "";

    // 对于嵌套的子组,需要加括号
    const joined = itemStrings.join(` ${logicalStr} `);

    // 只有当这是嵌套组时才加括号
    if (isNested) {
      return `(${joined})`;
    }

    return joined;
  } else {
    // 处理条件
    const entries = Object.entries(value);
    if (entries.length === 0) return "";

    const [field, operatorValuePair] = entries[0];
    if (!operatorValuePair) return "";

    const operatorEntries = Object.entries(operatorValuePair);
    if (operatorEntries.length === 0) return "";

    const [operator, targetValue] = operatorEntries[0];

    const operatorStr = operatorToString(operator as ComplexFilterOperator);

    // 格式化值 - Shopify 格式: field:value (字段和值之间没有空格)
    let valueStr = String(targetValue);
    if (typeof targetValue === "string" && targetValue.includes(" ")) {
      valueStr = `"${targetValue}"`;
    }

    return `${field}${operatorStr}${valueStr}`;
  }
}

/**
 * 从 Shopify 格式的字符串解析运算符
 */
function parseOperatorFromString(
  opStr: string,
): ComplexFilterOperator | undefined {
  const operatorMap: Record<string, ComplexFilterOperator> = {
    ":": "$eq",
    ":-": "$ne",
    ":>": "$gt",
    ":>=": "$gte",
    ":<": "$lt",
    ":<=": "$lte",
  };
  return operatorMap[opStr.trim()];
}

/**
 * 将 Shopify 搜索语法格式的字符串转换回 ComplexFilterValue 对象
 * 例如: "name:Joe AND age:>18" 转换为 { $and: [{ name: { $eq: "Joe" } }, { age: { $gt: 18 } }] }
 * 参考: https://shopify.dev/docs/api/usage/search-syntax
 */
export function stringToFilterValue(str: string): ComplexFilterValue {
  const trimmed = str.trim();

  if (!trimmed) {
    return { [ComplexFilterLogical.AND]: [] };
  }

  // 运算符映射（按照长度从长到短排序，避免 :>= 被匹配为 :>）
  const operatorPatterns: Array<{
    pattern: string;
    operator: ComplexFilterOperator;
  }> = [
    { pattern: ":>=", operator: "$gte" },
    { pattern: ":<=", operator: "$lte" },
    { pattern: ":-", operator: "$ne" },
    { pattern: ":>", operator: "$gt" },
    { pattern: ":<", operator: "$lt" },
    { pattern: ":", operator: "$eq" },
  ];

  /**
   * 按逻辑运算符拆分字符串，但要考虑括号嵌套
   */
  const splitByLogical = (expr: string, logicalOp: string): string[] | null => {
    const parts: string[] = [];
    let current = "";
    let depth = 0;
    let i = 0;

    while (i < expr.length) {
      const char = expr[i];

      if (char === "(") {
        depth++;
        current += char;
        i++;
      } else if (char === ")") {
        depth--;
        current += char;
        i++;
      } else if (depth === 0) {
        // 只在括号外层检查逻辑运算符
        const remaining = expr.substring(i);
        const regex = new RegExp(`^\\s+(${logicalOp})\\s+`, "i");
        const match = remaining.match(regex);

        if (match) {
          parts.push(current.trim());
          current = "";
          i += match[0].length;
        } else {
          current += char;
          i++;
        }
      } else {
        current += char;
        i++;
      }
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts.length > 1 ? parts : null;
  };

  // 解析表达式
  const parseExpression = (expr: string): ComplexFilterValue => {
    expr = expr.trim();
    let hadParens = false;

    // 检查是否被括号包围且是完整配对
    if (expr.startsWith("(") && expr.endsWith(")")) {
      let depth = 0;
      let isWrapped = true;

      for (let i = 0; i < expr.length; i++) {
        if (expr[i] === "(") depth++;
        if (expr[i] === ")") depth--;

        // 如果在中间位置深度降为 0，说明不是完整包围
        if (depth === 0 && i < expr.length - 1) {
          isWrapped = false;
          break;
        }
      }

      if (isWrapped) {
        hadParens = true;
        expr = expr.slice(1, -1).trim();
      }
    }

    // 先尝试 OR (优先级更高)
    let parts = splitByLogical(expr, "OR");
    if (parts) {
      const items = parts.map((part) => parseExpression(part));
      return { [ComplexFilterLogical.OR]: items };
    }

    // 再尝试 AND
    parts = splitByLogical(expr, "AND");
    if (parts) {
      const items = parts.map((part) => parseExpression(part));
      return { [ComplexFilterLogical.AND]: items };
    }

    // 尝试解析为条件 - Shopify 格式: field:value (没有空格)
    for (const { pattern, operator } of operatorPatterns) {
      // 需要转义特殊字符
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`^(.+?)${escapedPattern}(.+)$`);
      const match = expr.match(regex);

      if (match) {
        const field = match[1].trim();
        let value: any = match[2].trim();

        // 移除值周围的引号
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // 尝试转换为数字
        const numValue = Number(value);
        if (!isNaN(numValue) && value !== "") {
          value = numValue;
        }

        const condition = { [field]: { [operator]: value } };

        // 如果原本有括号，包装成子组
        if (hadParens) {
          return { [ComplexFilterLogical.AND]: [condition] };
        }

        return condition;
      }
    }

    // 无法解析，返回空
    return { [ComplexFilterLogical.AND]: [] };
  };

  return parseExpression(trimmed);
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
      Partial<Record<ComplexFilterOperator, any>> | undefined,
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
    [filters, field],
  );

  const operators = useMemo(() => {
    return selectedFilter
      ? (selectedFilter.operators ?? filterOperators[selectedFilter.type])
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

      {selectedFilter?.type === ComplexFilterType.NUMBER ? (
        <NumberInput
          className="min-w-[200px] flex-1"
          placeholder={i18n.selectValue}
          value={targetValue ?? ""}
          onValueChange={(values) => handleValueChange(values.floatValue)}
          disabled={!operator}
        />
      ) : selectedFilter?.type === ComplexFilterType.DATE ||
        selectedFilter?.type === ComplexFilterType.DATETIME ? (
        <DateInput
          className="min-w-[200px] flex-1"
          placeholder={i18n.selectValue}
          value={targetValue ? new Date(targetValue) : undefined}
          onChange={(date) =>
            handleValueChange(date ? date.toISOString() : undefined)
          }
          disabled={!operator}
        />
      ) : (
        <Input
          className="min-w-[200px] flex-1"
          placeholder={i18n.selectValue}
          value={targetValue ?? ""}
          onChange={(e) => handleValueChange(e.target.value)}
          disabled={!operator}
        />
      )}

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
}

export const ComplexFilterGroup: FC<ComplexFilterGroupProps> = ({
  i18n,
  filters,
  value,
  onChange,
  onRemove,
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
      [logical]: [...items, { [ComplexFilterLogical.AND]: [{}] }],
    });
  };

  return (
    <div className="flex gap-2">
      <div className="bg-background flex-1 rounded-lg border p-4">
        {items.length > 0 && (
          <div className="mb-4 flex gap-2">
            {/* 左侧大括号连接线 + 逻辑运算符按钮 */}
            {items.length > 1 && (
              <div className="flex w-12 flex-col py-4 pl-4">
                {/* 上半部分 - 顶部圆角 + 垂直线 */}
                <div className="border-border w-full flex-1 rounded-tl-md border-t-2 border-l-2" />

                {/* 逻辑运算符按钮 - 居中放置 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="-translate-x-1/2 text-xs"
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
                  className="border-border w-full flex-1 rounded-bl-md border-b-2 border-l-2"
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
        )}

        <div className={cn("flex gap-2", items.length > 1 && "ml-12")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="mr-1 h-4 w-4" />
                {i18n.addCondition}
                <ChevronDown className="ml-1 h-4 w-4" />
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

export interface ComplexFilterProps<
  TFormat extends ComplexFilterValueFormat = "object",
> {
  filters: ComplexFilterItem[];
  i18n?: ComplexFilterI18n;
  valueFormat?: TFormat;
  value?: ComplexFilterValueByFormat<TFormat>;
  onChange?: (value: ComplexFilterValueByFormat<TFormat>) => void;
}

export const ComplexFilter = <
  TFormat extends ComplexFilterValueFormat = "object",
>({
  i18n = defaultComplexFilterI18n,
  filters,
  value,
  onChange,
  valueFormat = "object" as TFormat,
}: ComplexFilterProps<TFormat>) => {
  // 内部维护完整的 value（包括空条件），用于 UI 显示和编辑
  const [internalDisplayValue, setInternalDisplayValue] =
    useState<ComplexFilterValue>({
      [ComplexFilterLogical.AND]: [],
    });

  // 使用 ref 跟踪上一次清理后的 value 的字符串表示，用于去重
  const lastCleanedValueStrRef = useRef<string>("");

  // 受控模式：当外部 value 变化时，需要同步到内部 displayValue
  // 注意：只在外部真正变化时同步，避免因内部触发 onChange 导致的循环
  useEffect(() => {
    if (value !== undefined) {
      const currentCleanedStr = lastCleanedValueStrRef.current;

      // 根据 valueFormat 处理输入值
      let objectValue: ComplexFilterValue;
      if (valueFormat === "string" && typeof value === "string") {
        objectValue = stringToFilterValue(value);
      } else if (typeof value === "object") {
        objectValue = value;
      } else {
        objectValue = { [ComplexFilterLogical.AND]: [] };
      }

      const externalValueStr = JSON.stringify(objectValue);

      // 只有当外部值与上次输出的清理值不同时才同步
      // 这避免了因为我们输出清理值导致的无意义同步
      if (externalValueStr !== currentCleanedStr) {
        setInternalDisplayValue(objectValue);
      }
    }
  }, [value, valueFormat, i18n]);

  const handleChange = (newValue: ComplexFilterValue) => {
    // 内部保存完整的 value（包括空条件）
    setInternalDisplayValue(newValue);

    // 对外输出时清理空条件
    if (onChange) {
      const cleaned = cleanFilterValue(newValue);
      const finalObjectValue = cleaned ?? { [ComplexFilterLogical.AND]: [] };
      const finalValueStr = JSON.stringify(finalObjectValue);

      // 只在清理后的值真正改变时才调用 onChange
      if (finalValueStr !== lastCleanedValueStrRef.current) {
        lastCleanedValueStrRef.current = finalValueStr;

        // 根据 valueFormat 输出不同格式
        if (valueFormat === "string") {
          const stringValue = filterValueToString(finalObjectValue);
          onChange(stringValue as ComplexFilterValueByFormat<TFormat>);
        } else {
          onChange(finalObjectValue as ComplexFilterValueByFormat<TFormat>);
        }
      }
    }
  };

  const handleClearAll = () => {
    const emptyValue = { [ComplexFilterLogical.AND]: [] };
    setInternalDisplayValue(emptyValue);
    if (onChange) {
      const emptyValueStr = JSON.stringify(emptyValue);
      lastCleanedValueStrRef.current = emptyValueStr;

      // 根据 valueFormat 输出不同格式
      if (valueFormat === "string") {
        onChange("" as ComplexFilterValueByFormat<TFormat>);
      } else {
        onChange(emptyValue as unknown as ComplexFilterValueByFormat<TFormat>);
      }
    }
  };

  if (isFilterGroup(internalDisplayValue)) {
    return (
      <div className="space-y-4">
        <ComplexFilterGroup
          i18n={i18n}
          filters={filters}
          value={internalDisplayValue}
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

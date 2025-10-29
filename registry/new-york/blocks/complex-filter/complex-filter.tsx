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

export enum ComplexFilterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  DATE = "date",
  DATETIME = "datetime",
}

export enum ComplexFilterLogical {
  AND = "$and",
  NOT = "$not",
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

export type ComplexFilterStringCondition = {
  [K in ComplexFilterOperator]: string;
};

export type ComplexFilterGroupValue =
  | {
      [ComplexFilterLogical.AND]: ComplexFilterValue[];
    }
  | {
      [ComplexFilterLogical.OR]: ComplexFilterValue[];
    };

export type ComplexFilterValue =
  | ComplexFilterGroupValue
  | Record<string, { [K in ComplexFilterOperator]: string }>;

const filterOperators: Record<ComplexFilterType, ComplexFilterOperator[]> = {
  [ComplexFilterType.STRING]: ["$eq", "$ne", "$like", "$nlike"],
  [ComplexFilterType.NUMBER]: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
  [ComplexFilterType.BOOLEAN]: ["$eq", "$ne"],
  [ComplexFilterType.DATE]: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
  [ComplexFilterType.DATETIME]: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
};

export interface ComplexFilterInputProps {
  i18n: ComplexFilterI18n;
  filters: ComplexFilterItem[];
}

export const ComplexFilterInput: FC<ComplexFilterInputProps> = ({
  i18n,
  filters,
}) => {
  const [selectedFilter, setSelectedFilter] =
    useState<ComplexFilterItem | null>(null);

  const operators = useMemo(() => {
    return selectedFilter
      ? selectedFilter.operators ?? filterOperators[selectedFilter.type]
      : [];
  }, [selectedFilter]);

  return (
    <div className="flex gap-2">
      <Select
        value={selectedFilter?.field}
        onValueChange={(value) =>
          setSelectedFilter(
            filters.find((filter) => filter.field === value) || null
          )
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="请选择筛选项" />
        </SelectTrigger>
        <SelectContent>
          {filters.map((filter) => (
            <SelectItem key={filter.field} value={filter.field}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select disabled={!selectedFilter}>
        <SelectTrigger>
          <SelectValue placeholder="运算符" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((operator) => (
            <SelectItem key={operator} value={operator}>
              {i18n.operators[operator]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export interface ComplexFilterItem {
  type: ComplexFilterType;
  label: string;
  field: string;
  operators: ComplexFilterOperator[];
}

export interface ComplexFilterI18n {
  operators: Record<ComplexFilterOperator, string>;
}

export interface ComplexFilterProps {
  filters: ComplexFilterItem[];
  i18n?: ComplexFilterI18n;
  value?: ComplexFilterValue;
  onChange?: (value: ComplexFilterValue) => void;
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
};

export interface ComplexFilterGroupProps {
  i18n: ComplexFilterI18n;
  filters: ComplexFilterItem[];
  value: ComplexFilterGroupValue;
  onChange: (value: ComplexFilterGroupValue) => void;
}

export const ComplexFilterGroup: FC<ComplexFilterGroupProps> = ({
  i18n,
  filters,
  value,
  onChange,
}) => {
  const [logical, items]: [ComplexFilterLogical, ComplexFilterValue[]] =
    useMemo(() => {
      if (ComplexFilterLogical.AND in value) {
        return [ComplexFilterLogical.AND, value[ComplexFilterLogical.AND]];
      }
      if (ComplexFilterLogical.OR in value) {
        return [ComplexFilterLogical.OR, value[ComplexFilterLogical.OR]];
      }
      return [ComplexFilterLogical.AND, []];
    }, [value]);

  return (
    <div>
      <div className="mb-2">
        {items.map((item, index) => (
          <ComplexFilterInput key={index} i18n={i18n} filters={filters} />
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">添加筛选条件</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              onChange({
                [logical]: [...items, {}],
              });
            }}
          >
            添加筛选条件
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onChange({
                [logical]: [
                  ...items,
                  {
                    [ComplexFilterLogical.AND]: [],
                  },
                ],
              });
            }}
          >
            添加筛选条件组
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const ComplexFilter: FC<ComplexFilterProps> = ({
  i18n = defaultComplexFilterI18n,
  filters,
}) => {
  const [value, setValue] = useState<ComplexFilterValue | null>({
    [ComplexFilterLogical.AND]: [],
  });

  if (
    value &&
    typeof value === "object" &&
    (Object.keys(value).includes(ComplexFilterLogical.AND) ||
      Object.keys(value).includes(ComplexFilterLogical.OR))
  ) {
    return (
      <ComplexFilterGroup
        i18n={i18n}
        filters={filters}
        value={value as ComplexFilterGroupValue}
      />
    );
  }

  return (
    <div>
      <ComplexFilterInput i18n={i18n} filters={filters} />
    </div>
  );
};

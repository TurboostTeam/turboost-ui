import { FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export enum ComplexFilterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  DATE = "date",
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
  | ComplexFilterMembershipOperator;

export type ComplexFilterStringWhere = {
  [K in ComplexFilterOperator]: string;
};

export type ComplexFilterValue = {
  [K in ComplexFilterLogical]:
    | ComplexFilterValue
    | {
        [K in ComplexFilterOperator]: string;
      };
};

export interface ComplexFilterConditionProps {
  value: string;
  onChange: (value: string) => void;
}

export const ComplexFilterCondition: FC<ComplexFilterConditionProps> = () => {
  return <div>ComplexFilter</div>;
};

export interface ComplexFilterItem {
  type: ComplexFilterType;
  label: string;
  field: string;
}

export interface ComplexFilterProps {
  filters: ComplexFilterItem[];
  value?: ComplexFilterValue;
  onChange?: (value: ComplexFilterValue) => void;
}

export const ComplexFilter: FC<ComplexFilterProps> = ({ filters }) => {
  return <div>
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select a filter" />
      </SelectTrigger>
      <SelectContent>
        {filters.map((filter) => (
          <SelectItem key={filter.field} value={filter.field}>{filter.label}</SelectItem>
        ))}
      </SelectContent>
  </div>;
};

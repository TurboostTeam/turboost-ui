import dayjs from "dayjs";
import { compact, get, trim } from "lodash";

import { FilterItemProps } from "@/registry/new-york/blocks/filter/filter";
import { Field } from "@/registry/new-york/types/field";

export function buildGraphqlQueryFromFilterValues<Node>(
  filters: FilterItemProps<Node>[],
  filterValues?: Record<Field<Node>, any>
): string {
  return compact([
    trim((filterValues as any)?.query),
    trim(
      filters.reduce((result, filter) => {
        const filterValue: any = get(filterValues ?? {}, filter.field);

        if (typeof filterValue !== "undefined") {
          if (typeof filterValue === "string") {
            return `${result} ${filter.field}:"${filterValue}"`;
          }

          if (filterValue instanceof Array) {
            if (filterValue.length === 0) {
              return result;
            }

            if (
              filterValue[0] instanceof Date &&
              filterValue[1] instanceof Date
            ) {
              return `${result} (${filterValue
                .map((item: Date, index) => {
                  return `${filter.field}:${index === 0 ? ">=" : "<="}${
                    index === 0
                      ? dayjs(item).toISOString()
                      : dayjs(item).endOf("day").toISOString()
                  }`;
                })
                .join(" ")})`;
            }

            return `${result} (${filterValue
              .map((item) => {
                if (typeof item === "string") {
                  return `${filter.field}:"${item}"`;
                }

                return `${filter.field}:"${item}"`;
              })
              .join(" OR ")})`;
          }

          return `${result} ${filter.field}: ${
            filterValue instanceof Date
              ? filterValue.toISOString()
              : filterValue
          }`;
        }

        return result;
      }, "")
    ),
  ])
    .map((item) => `(${item})`)
    .join(" ");
}

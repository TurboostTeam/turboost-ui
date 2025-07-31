import { FilterItemProps } from "../filter";

export type TypeValue =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | ArrayConstructor;

export const transformTypeValue = (
  value: any,
  type?: TypeValue,
  itemType?: TypeValue,
): any => {
  if (typeof type === "undefined") {
    return value;
  }

  try {
    switch (type) {
      case String:
        return String(value);
      case Number:
        return Number(value);
      case Boolean:
        return Boolean(value);
      case Date:
        return new Date(value);
      case Array:
        if (Array.isArray(value)) {
          return typeof itemType !== "undefined"
            ? value.map((item: any) => transformTypeValue(item, itemType))
            : value;
        } else if (value !== null && typeof value !== "undefined") {
          return typeof itemType !== "undefined"
            ? [transformTypeValue(value, itemType)]
            : [value];
        } else {
          return [];
        }
      default:
        return value;
    }
  } catch {
    return value;
  }
};

export const transformObjectByFields = (
  obj: Record<string, any>,
  filters: FilterItemProps<any>[],
): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    const filter = filters.find((f) => f.field === key);

    if (filter) {
      result[key] = transformTypeValue(obj[key], filter.type, filter.itemType);
    } else {
      result[key] = obj[key];
    }
  }

  return result;
};

import { z } from "zod";

export const defaultSearchParamsSchema = z.record(z.string(), z.any());

function encode(
  obj: Record<string, any>,
  stringify: (value: any) => string = String,
): string {
  const result = new URLSearchParams();

  for (const key in obj) {
    const val = obj[key];
    if (val !== undefined) {
      result.set(key, stringify(val));
    }
  }

  return result.toString();
}

function toValue(str: unknown) {
  if (!str) return "";

  if (str === "false") return false;
  if (str === "true") return true;
  return +str * 0 === 0 && +str + "" === str ? +str : str;
}

function decode(str: any): any {
  const searchParams = new URLSearchParams(str);

  const result: Record<string, unknown> = {};

  for (const [key, value] of searchParams.entries()) {
    const previousValue = result[key];
    if (previousValue == null) {
      result[key] = toValue(value);
    } else if (Array.isArray(previousValue)) {
      previousValue.push(toValue(value));
    } else {
      result[key] = [previousValue, toValue(value)];
    }
  }

  return result;
}

export function parseSearchParams<
  T extends z.ZodType = typeof defaultSearchParamsSchema,
>(searchStr: string, schema?: T): z.infer<T> {
  if (searchStr[0] === "?") {
    searchStr = searchStr.substring(1);
  }

  const query: Record<string, unknown> = decode(searchStr);

  // Try to parse any query params that might be json
  for (const key in query) {
    const value = query[key];
    if (typeof value === "string") {
      try {
        query[key] = JSON.parse(value);
      } catch (_err) {
        // silent
      }
    }
  }

  return (schema ?? defaultSearchParamsSchema).parse(query) as z.infer<T>;
}

export function stringifySearchParamsWith() {
  function stringifyValue(val: any) {
    if (typeof val === "object" && val !== null) {
      try {
        return JSON.stringify(val);
      } catch (_err) {
        // silent
      }
    } else if (typeof val === "string") {
      try {
        // Check if it's a valid parseable string.
        // If it is, then stringify it again.
        JSON.parse(val);
        return JSON.stringify(val);
      } catch (_err) {
        // silent
      }
    }
    return val;
  }

  return (search: Record<string, any>) => {
    const searchStr = encode(search, stringifyValue);
    return searchStr ? `?${searchStr}` : "";
  };
}

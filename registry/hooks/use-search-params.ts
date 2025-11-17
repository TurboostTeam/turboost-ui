import { useMemo } from "react";
import {
  defaultSearchParamsSchema,
  parseSearchParams,
} from "@/registry/lib/search-params";
import z from "zod";

export function useSearchParams<
  T extends z.ZodType = typeof defaultSearchParamsSchema,
>(searchStr: string, schema?: T): z.infer<T> {
  return useMemo(
    () => parseSearchParams(searchStr, schema),
    [searchStr, schema],
  );
}

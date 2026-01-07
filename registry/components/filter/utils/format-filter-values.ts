export function formatFilterValues(
  values: Record<string, any>,
  formatValue?: (field: string, value: any) => any,
): Record<string, any> {
  const filter: Record<string, any> = {};

  for (const [key, value] of Object.entries(values)) {
    filter[key] = formatValue?.(key, value) ?? value;
  }

  return filter;
}

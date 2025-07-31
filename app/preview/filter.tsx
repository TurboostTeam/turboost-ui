import { Filter } from "@/registry/new-york/blocks/filter/filter";
import { Input } from "@/registry/new-york/ui/input";
import { Info, Search } from "lucide-react";

export function FilterPreview() {
  return (
    <Filter<{ name: string }>
      search={{
        queryPlaceholder: "Search",
        queryPrefix: <Search className="size-4" />,
        querySuffix: <Info className="size-4" />,
      }}
      filters={[
        {
          pinned: true,
          label: "Name",
          field: "name",
          render({ field: { value, onChange } }) {
            return <Input value={value} onChange={onChange} />;
          },
        },
      ]}
      onChange={(value) => {
        console.log("onChange", value);
      }}
    />
  );
}

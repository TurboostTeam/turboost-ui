import { Filter } from "@/registry/components/filter/filter";
import { Input } from "@/components/ui/input";
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

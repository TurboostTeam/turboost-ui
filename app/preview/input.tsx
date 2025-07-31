import { Input } from "@/registry/new-york/blocks/input/input";
import { Info, Search } from "lucide-react";

export function InputPreview() {
  return (
    <Input
      prefix={<Search className="size-4" />}
      suffix={<Info className="size-4" />}
    />
  );
}

import { FilterPreview } from "./filter";
import { TablePreview } from "./table";
import { TagsInputPreview } from "./tags-input";
import { ViewPreview } from "./view";

export const components = [
  { name: "Tags Input", type: "表单", content: <TagsInputPreview /> },
  { name: "View", type: "视图", content: <ViewPreview /> },
  { name: "Table", type: "视图", content: <TablePreview /> },
  { name: "Filter", type: "视图", content: <FilterPreview /> },
];

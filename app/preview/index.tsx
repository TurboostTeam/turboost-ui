import { TagsInputPreview } from "./tags-input";
import { ViewPreview } from "./view";
import { LoadingPreview } from "./loading";

export const components = [
  { name: "Tags Input", type: "表单", content: <TagsInputPreview /> },
  { name: "View", type: "视图", content: <ViewPreview /> },
  { name: "Loading", type: "状态", content: <LoadingPreview /> },
];

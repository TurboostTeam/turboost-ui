"use client";

import { TagsInput } from "@/registry/new-york/blocks/tags-input/tags-input";
import { useState } from "react";

export function TagsInputPreview() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <TagsInput value={value} placeholder="placeholder" onChange={setValue} />
  );
}

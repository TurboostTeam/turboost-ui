"use client";

import { useState } from "react";

import { TagsInput } from "@/registry/components/tags-input/tags-input";

export function TagsInputPreview() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <TagsInput value={value} placeholder="placeholder" onChange={setValue} />
  );
}

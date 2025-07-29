"use client";

import { TagsInput as TagsInputComponent } from "@/registry/new-york/blocks/tags-input/tags-input";
import { useState } from "react";

export function TagsInput() {
  const [value, setValue] = useState<string[]>([]);

  return <TagsInputComponent value={value} onChange={setValue} />;
}

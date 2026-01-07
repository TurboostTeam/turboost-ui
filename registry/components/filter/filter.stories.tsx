import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { NumberInput } from "../number-input/number-input";
import { Filter, FilterValues } from "./filter";
import { Info, Search } from "lucide-react";

const meta = {
  title: "Components/Filter",
  component: Filter,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

const FilterWithState = () => {
  const [query, setQuery] = useState<string>("123");
  const [values, setValues] = useState<FilterValues>({
    name: "张三",
    age: 18,
    email: "zhangsan@example.com",
  });

  return (
    <div className="w-fit">
      <Filter
        search={{
          placeholder: "Search",
          prefix: <Search className="size-4" />,
          suffix: <Info className="size-4" />,
          value: query,
          onChange: setQuery,
        }}
        filters={[
          {
            pinned: true,
            label: "姓名",
            field: "name",
            render: ({ field: { value, onChange } }) => (
              <Input value={value} onChange={(e) => onChange(e.target.value)} />
            ),
            renderValue: ({ value }) => value,
          },
          {
            pinned: true,
            label: "年龄",
            field: "age",
            render: ({ field: { value, onChange } }) => (
              <NumberInput
                value={Number(value)}
                onChange={(e) => onChange(Number(e.target.value))}
              />
            ),
            renderValue: ({ value }) => value,
          },
          {
            label: "邮箱",
            field: "email",
            render: ({ field: { value, onChange } }) => (
              <Input value={value} onChange={(e) => onChange(e.target.value)} />
            ),
            renderValue: ({ value }) => value,
          },
        ]}
        values={values}
        onChange={setValues}
      />
    </div>
  );
};

export const Default: Story = {
  args: {
    filters: [],
  },
  render: () => <FilterWithState />,
};

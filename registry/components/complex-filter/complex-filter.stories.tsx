import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

import {
  ComplexFilter,
  ComplexFilterType,
  ComplexFilterValue,
} from "./complex-filter";
import { Input } from "@/components/ui/input";
import { NumberInput } from "../number-input/number-input";

const meta = {
  title: "Components/Complex Filter",
  component: ComplexFilter,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ComplexFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

const ComplexFilterWithState = () => {
  const [value, setValue] = useState<ComplexFilterValue>({
    $and: [
      { name: { $eq: "未完成" } },
      {
        $or: [{ status: { $eq: "未完成" } }, { age: { $lt: "18" } }],
      },
    ],
  });

  return (
    <div className="w-full max-w-4xl">
      <ComplexFilter
        filters={[
          {
            field: "name",
            label: "姓名",
            type: ComplexFilterType.STRING,
            render: ({ value, onChange }) => (
              <Input value={value} onChange={onChange} />
            ),
          },
          {
            field: "status",
            label: "状态",
            type: ComplexFilterType.STRING,
            render: ({ value, onChange }) => (
              <Input value={value} onChange={onChange} />
            ),
          },
          {
            field: "age",
            label: "年龄",
            type: ComplexFilterType.NUMBER,
            render: ({ value, onChange }) => (
              <NumberInput value={value} onChange={onChange} />
            ),
          },
          {
            field: "birthday",
            label: "出生日期",
            type: ComplexFilterType.DATE,
          },
          {
            field: "createdAt",
            label: "创建时间",
            type: ComplexFilterType.DATETIME,
            render: ({ value, onChange }) => (
              <DateTimeInput value={value} onChange={onChange} />
            ),
          },
          {
            field: "isActive",
            label: "是否激活",
            type: ComplexFilterType.BOOLEAN,
          },
        ]}
        value={value}
        onChange={setValue}
      />
      <div className="bg-muted mt-4 rounded-lg p-4">
        <h3 className="mb-2 font-semibold">当前 Value:</h3>
        <pre className="overflow-auto text-sm">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const Default: Story = {
  args: {
    filters: [],
  },
  render: () => <ComplexFilterWithState />,
};

export const Empty: Story = {
  args: {
    filters: [
      {
        field: "name",
        label: "姓名",
        type: ComplexFilterType.STRING,
      },
      {
        field: "age",
        label: "年龄",
        type: ComplexFilterType.NUMBER,
      },
      {
        field: "email",
        label: "邮箱",
        type: ComplexFilterType.STRING,
      },
    ],
  },
};

export const WithInitialValue: Story = {
  args: {
    filters: [
      {
        field: "name",
        label: "姓名",
        type: ComplexFilterType.STRING,
      },
      {
        field: "age",
        label: "年龄",
        type: ComplexFilterType.NUMBER,
      },
    ],
    value: {
      $and: [{ name: { $eq: "Joe" } }, { age: { $lt: "18" } }],
    },
  },
};

const ComplexFilterWithStringFormat = () => {
  const [value, setValue] = useState<string>("name:Joe AND age:<18");

  return (
    <div className="w-full max-w-4xl">
      <ComplexFilter
        filters={[
          {
            field: "name",
            label: "姓名",
            type: ComplexFilterType.STRING,
          },
          {
            field: "age",
            label: "年龄",
            type: ComplexFilterType.NUMBER,
          },
          {
            field: "status",
            label: "状态",
            type: ComplexFilterType.STRING,
          },
        ]}
        value={value}
        onChange={setValue}
        valueFormat="string"
      />
      <div className="bg-muted mt-4 rounded-lg p-4">
        <h3 className="mb-2 font-semibold">当前 Value (String 格式):</h3>
        <pre className="overflow-auto text-sm">{value}</pre>
      </div>
    </div>
  );
};

export const StringFormat: Story = {
  args: {
    filters: [],
  },
  render: () => <ComplexFilterWithStringFormat />,
};

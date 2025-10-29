import type { Meta, StoryObj } from "@storybook/react";
import { ComplexFilter, ComplexFilterType, ComplexFilterValue } from "./complex-filter";
import { useState } from "react";

const meta = {
  title: "Blocks/ComplexFilter",
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
        $or: [
          { status: { $eq: "未完成" } },
          { age: { $lt: "18" } },
        ],
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
          },
          {
            field: "status",
            label: "状态",
            type: ComplexFilterType.STRING,
          },
          {
            field: "age",
            label: "年龄",
            type: ComplexFilterType.NUMBER,
          },
          {
            field: "createdAt",
            label: "创建时间",
            type: ComplexFilterType.DATETIME,
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
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">当前 Value:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const Default: Story = {
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
      $and: [
        { name: { $eq: "Joe" } },
        { age: { $lt: "18" } },
      ],
    },
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import dayjs from "dayjs";

import { DateInput } from "./date-input";

const meta = {
  title: "Components/Date Input",
  component: DateInput,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础示例
const DateInputWithState = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full max-w-md space-y-4">
      <DateInput value={date} onChange={setDate} className="w-80" />
      <div className="bg-muted rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期:</h3>
        <pre className="overflow-auto text-sm">
          {date ? date.toLocaleDateString("zh-CN") : "未选择"}
        </pre>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <DateInputWithState />,
};

// 无初始值
const DateInputEmpty = () => {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="w-full max-w-md space-y-4">
      <DateInput
        value={date}
        onChange={setDate}
        placeholder="请选择日期"
        className="w-80"
      />
      <div className="bg-muted rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期:</h3>
        <pre className="overflow-auto text-sm">
          {date ? date.toLocaleDateString("zh-CN") : "未选择"}
        </pre>
      </div>
    </div>
  );
};

export const Empty: Story = {
  render: () => <DateInputEmpty />,
};

// 自定义日期格式
const DateInputCustomFormat = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full max-w-md space-y-4">
      <DateInput
        value={date}
        onChange={setDate}
        formatDate={(date) => dayjs(date).format("YYYY年MM月DD日")}
        className="w-80"
      />
      <div className="bg-muted rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期:</h3>
        <pre className="overflow-auto text-sm">
          {date ? dayjs(date).format("YYYY-MM-DD HH:mm:ss") : "未选择"}
        </pre>
      </div>
    </div>
  );
};

export const CustomFormat: Story = {
  render: () => <DateInputCustomFormat />,
};

// 禁用状态
export const Disabled: Story = {
  args: {
    value: new Date(),
    disabled: true,
    className: "w-80",
  },
};

// 不同的按钮变体
const DateInputVariants = () => {
  const [date1, setDate1] = useState<Date | undefined>(new Date());
  const [date2, setDate2] = useState<Date | undefined>(new Date());
  const [date3, setDate3] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Outline</label>
        <DateInput value={date1} onChange={setDate1} variant="outline" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Ghost</label>
        <DateInput value={date2} onChange={setDate2} variant="ghost" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Default</label>
        <DateInput value={date3} onChange={setDate3} variant="default" />
      </div>
    </div>
  );
};

export const Variants: Story = {
  render: () => <DateInputVariants />,
};

// 限制日期范围
const DateInputWithRange = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full max-w-md space-y-4">
      <DateInput
        value={date}
        onChange={setDate}
        placeholder="选择未来30天内的日期"
        calendarProps={{
          fromDate: new Date(),
          toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }}
        className="w-80"
      />
      <div className="bg-muted rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期:</h3>
        <pre className="overflow-auto text-sm">
          {date ? date.toLocaleDateString("zh-CN") : "未选择"}
        </pre>
      </div>
    </div>
  );
};

export const WithDateRange: Story = {
  render: () => <DateInputWithRange />,
};

// 禁用周末
const DateInputDisableWeekends = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full max-w-md space-y-4">
      <DateInput
        value={date}
        onChange={setDate}
        placeholder="仅工作日可选"
        calendarProps={{
          disabled: [{ dayOfWeek: [0, 6] }],
        }}
        className="w-80"
      />
      <div className="bg-muted rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期:</h3>
        <pre className="overflow-auto text-sm">
          {date ? date.toLocaleDateString("zh-CN") : "未选择"}
        </pre>
      </div>
    </div>
  );
};

export const DisableWeekends: Story = {
  render: () => <DateInputDisableWeekends />,
};

// 带预设的日期选择
const DateInputWithPresets = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full max-w-md space-y-4">
      <DateInput
        value={date}
        onChange={setDate}
        calendarProps={{
          presets: [
            { label: "今天", value: dayjs().toDate() },
            { label: "昨天", value: dayjs().add(-1, "d").toDate() },
            { label: "上周", value: dayjs().add(-7, "d").toDate() },
            { label: "上个月", value: dayjs().add(-1, "month").toDate() },
            { label: "今年年初", value: dayjs().startOf("year").toDate() },
          ],
        }}
        className="w-80"
      />
      <div className="bg-muted rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期:</h3>
        <pre className="overflow-auto text-sm">
          {date ? date.toLocaleDateString("zh-CN") : "未选择"}
        </pre>
      </div>
    </div>
  );
};

export const WithPresets: Story = {
  render: () => <DateInputWithPresets />,
};

// 表单使用示例
const DateInputInForm = () => {
  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `开始日期: ${formData.startDate.toLocaleDateString("zh-CN")}\n结束日期: ${formData.endDate.toLocaleDateString("zh-CN")}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <label htmlFor="startDate" className="text-sm font-medium">
          开始日期
        </label>
        <DateInput
          value={formData.startDate}
          onChange={(date) =>
            setFormData((prev) => ({
              ...prev,
              startDate: date || new Date(),
            }))
          }
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="endDate" className="text-sm font-medium">
          结束日期
        </label>
        <DateInput
          value={formData.endDate}
          onChange={(date) =>
            setFormData((prev) => ({
              ...prev,
              endDate: date || new Date(),
            }))
          }
          calendarProps={{
            fromDate: formData.startDate,
          }}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
      >
        提交
      </button>

      <div className="bg-muted rounded-lg p-4">
        <h3 className="mb-2 font-semibold">表单数据:</h3>
        <pre className="overflow-auto text-sm">
          {JSON.stringify(
            {
              startDate: formData.startDate.toLocaleDateString("zh-CN"),
              endDate: formData.endDate.toLocaleDateString("zh-CN"),
            },
            null,
            2,
          )}
        </pre>
      </div>
    </form>
  );
};

export const InForm: Story = {
  render: () => <DateInputInForm />,
};

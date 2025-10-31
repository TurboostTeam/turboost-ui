import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import dayjs from "dayjs";

import { Calendar, CalendarPreset } from "./calendar";

const meta = {
  title: "Blocks/Calendar",
  component: Calendar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础单选日历示例
const CalendarWithSingleSelect = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full max-w-sm">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
      <div className="bg-muted mt-4 rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期:</h3>
        <pre className="overflow-auto text-sm">
          {date ? date.toLocaleDateString("zh-CN") : "未选择"}
        </pre>
      </div>
    </div>
  );
};

// 范围选择日历示例
const CalendarWithRangeSelect = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return (
    <div className="w-full max-w-sm">
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={setDateRange}
        className="rounded-md border"
      />
      <div className="bg-muted mt-4 rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期范围:</h3>
        <pre className="overflow-auto text-sm">
          {dateRange?.from
            ? `从: ${dateRange.from.toLocaleDateString("zh-CN")}`
            : "未选择开始日期"}
          {"\n"}
          {dateRange?.to
            ? `到: ${dateRange.to.toLocaleDateString("zh-CN")}`
            : "未选择结束日期"}
        </pre>
      </div>
    </div>
  );
};

// 多选日历示例
const CalendarWithMultipleSelect = () => {
  const [dates, setDates] = useState<Date[] | undefined>([
    new Date(),
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  ]);

  return (
    <div className="w-full max-w-sm">
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
      />
      <div className="bg-muted mt-4 rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期列表:</h3>
        <pre className="overflow-auto text-sm">
          {dates && dates.length > 0
            ? dates.map((d) => d.toLocaleDateString("zh-CN")).join("\n")
            : "未选择"}
        </pre>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <CalendarWithSingleSelect />,
};

export const RangeSelect: Story = {
  render: () => <CalendarWithRangeSelect />,
};

export const MultipleSelect: Story = {
  render: () => <CalendarWithMultipleSelect />,
};

export const WithDisabledDates: Story = {
  args: {
    mode: "single",
    disabled: [
      { from: new Date(0), to: new Date() },
      { dayOfWeek: [0, 6] }, // 禁用周末
    ],
    className: "rounded-md border",
  },
};

export const WithMinMaxDates: Story = {
  args: {
    mode: "single",
    fromDate: new Date(),
    toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 未来30天
    className: "rounded-md border",
  },
};

export const WithDropdowns: Story = {
  args: {
    mode: "single",
    captionLayout: "dropdown",
    fromYear: 2020,
    toYear: 2030,
    className: "rounded-md border",
  },
};

// 带预设选项的日历示例
const CalendarWithPresets = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full max-w-3xl">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
        presets={[
          { label: "今天", value: dayjs().toDate() },
          { label: "昨天", value: dayjs().add(-1, "d").toDate() },
          { label: "上周", value: dayjs().add(-7, "d").toDate() },
          { label: "上个月", value: dayjs().add(-1, "month").toDate() },
          { label: "今年年初", value: dayjs().startOf("year").toDate() },
          {
            label: "去年年初",
            value: dayjs().add(-1, "year").startOf("year").toDate(),
          },
        ]}
      />
      <div className="bg-muted mt-4 rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期:</h3>
        <pre className="overflow-auto text-sm">
          {date ? date.toLocaleDateString("zh-CN") : "未选择"}
        </pre>
      </div>
    </div>
  );
};

export const WithPresets: Story = {
  render: () => <CalendarWithPresets />,
};

// 范围选择模式的预设示例 - 展示根据 mode 自动推断类型
const CalendarRangeWithPresets = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return (
    <div className="w-full max-w-3xl">
      <Calendar
        mode="range"
        numberOfMonths={2}
        selected={dateRange}
        onSelect={setDateRange}
        className="rounded-md border"
        presets={[
          {
            label: "今天",
            value: { from: dayjs().toDate(), to: dayjs().toDate() },
          },
          {
            label: "本周",
            value: {
              from: dayjs().startOf("week").toDate(),
              to: dayjs().endOf("week").toDate(),
            },
          },
          {
            label: "本月",
            value: {
              from: dayjs().startOf("month").toDate(),
              to: dayjs().endOf("month").toDate(),
            },
          },
          {
            label: "近三个月",
            value: {
              from: dayjs().subtract(3, "month").startOf("month").toDate(),
              to: dayjs().endOf("month").toDate(),
            },
          },
        ]}
      />
      <div className="bg-muted mt-4 rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期范围:</h3>
        <pre className="overflow-auto text-sm">
          {dateRange?.from
            ? `从: ${dateRange.from.toLocaleDateString("zh-CN")}`
            : "未选择开始日期"}
          {"\n"}
          {dateRange?.to
            ? `到: ${dateRange.to.toLocaleDateString("zh-CN")}`
            : "未选择结束日期"}
        </pre>
      </div>
    </div>
  );
};

export const RangeWithPresets: Story = {
  render: () => <CalendarRangeWithPresets />,
};

// 多选模式的预设示例
const CalendarMultipleWithPresets = () => {
  const [dates, setDates] = useState<Date[] | undefined>([new Date()]);

  // 根据 mode="multiple"，preset value 类型自动推断为 Date[]
  const multiplePresets: CalendarPreset<Date[]>[] = [
    {
      label: "今天",
      value: [dayjs().toDate()],
    },
    {
      label: "本周工作日",
      value: Array.from({ length: 5 }, (_, i) =>
        dayjs()
          .startOf("week")
          .add(i + 1, "d")
          .toDate(),
      ),
    },
    {
      label: "本月1号和15号",
      value: [
        dayjs().startOf("month").toDate(),
        dayjs().startOf("month").add(14, "d").toDate(),
      ],
    },
  ];

  return (
    <div className="w-full max-w-3xl">
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
        presets={multiplePresets}
        onPresetSelect={(selectedDates) => {
          // selectedDates 类型自动推断为 Date[]
          console.log("选中的日期数量:", selectedDates.length);
          setDates(selectedDates);
        }}
      />
      <div className="bg-muted mt-4 rounded-lg p-4">
        <h3 className="mb-2 font-semibold">选中的日期列表:</h3>
        <pre className="overflow-auto text-sm">
          {dates && dates.length > 0
            ? dates.map((d) => d.toLocaleDateString("zh-CN")).join("\n")
            : "未选择"}
        </pre>
      </div>
    </div>
  );
};

export const MultipleWithPresets: Story = {
  render: () => <CalendarMultipleWithPresets />,
};

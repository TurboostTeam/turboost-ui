import { forwardRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "../calendar/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateInputProps {
  /** 当前选中的日期 */
  value?: Date;
  /** 日期变化回调 */
  onChange?: (date: Date | undefined) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 日期格式化函数 */
  formatDate?: (date: Date) => string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 按钮变体 */
  variant?: "outline" | "ghost" | "default";
  /** Calendar 组件的额外属性 */
  calendarProps?: Omit<
    CalendarProps<"single">,
    "mode" | "selected" | "onSelect"
  >;
}

const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "选择日期",
      formatDate = (date: Date) => date.toLocaleDateString("zh-CN"),
      disabled = false,
      className,
      variant = "outline",
      calendarProps,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (date: Date | undefined) => {
      onChange?.(date);
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant={variant}
            disabled={disabled}
            className={cn(
              "flex w-full min-w-0 justify-between font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          >
            {value ? formatDate(value) : placeholder}
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            captionLayout="dropdown"
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    );
  },
);

DateInput.displayName = "DateInput";

export { DateInput };

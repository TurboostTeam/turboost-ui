import { Calendar as BaseCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentProps, useEffect, useState } from "react";
import type {
  PropsMultiRequired,
  PropsRangeRequired,
  PropsSingleRequired,
} from "react-day-picker";

// Calendar 的选择模式
export type CalendarMode = "single" | "multiple" | "range";

export type CalendarPreset<TMode extends CalendarMode> = {
  label: string;
  value: TMode extends "single"
    ? PropsSingleRequired["selected"]
    : TMode extends "multiple"
      ? PropsMultiRequired["selected"]
      : TMode extends "range"
        ? PropsRangeRequired["selected"]
        : never;
};

export type CalendarProps<TMode extends CalendarMode> = ComponentProps<
  typeof BaseCalendar
> & {
  mode: TMode;
  presets?: CalendarPreset<TMode>[];
};

export const Calendar = <TMode extends CalendarMode>({
  className,
  presets,
  ...props
}: CalendarProps<TMode>) => {
  const { onSelect } = props;

  const [month, setMonth] = useState<Date>();

  return (
    <div
      className={cn(
        "bg-background flex w-fit divide-x overflow-hidden",
        className,
      )}
    >
      {presets && presets.length > 0 && (
        <div className="flex flex-col gap-2 p-3">
          {presets.map((preset, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="justify-start text-[0.8rem] font-normal"
              onClick={() => {
                if (onSelect) {
                  setMonth(
                    preset.value instanceof Date ? preset.value : undefined,
                  );
                  (onSelect as any)(preset.value);
                }
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}

      <BaseCalendar
        month={month}
        onMonthChange={(value) => setMonth(value)}
        {...props}
      />
    </div>
  );
};

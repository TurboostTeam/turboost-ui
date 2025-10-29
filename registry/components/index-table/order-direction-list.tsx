import { ArrowDown, ArrowUp } from "lucide-react";
import { type FC, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export enum OrderDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export interface OrderDirectionListProps {
  className?: string;
  value?: OrderDirection;
  onChange?: (value: OrderDirection) => void;
  t?: Function;
}

export const OrderDirectionList: FC<OrderDirectionListProps> = ({
  className,
  value,
  onChange,
  t,
}) => {
  const translate = useMemo(() => {
    return typeof t === "function" ? t : () => undefined;
  }, [t]);

  const [options] = useState([
    {
      label: translate(
        "turboost_ui.index_table.order_direction_list.sort_option.oldest_first"
      ),
      value: OrderDirection.ASC,
    },
    {
      label: translate(
        "turboost_ui.index_table.order_direction_list.sort_option.newest_first"
      ),
      value: OrderDirection.DESC,
    },
  ]);

  return (
    <div className={cn("flex flex-col gap-1 pt-1", className)}>
      {options.map((option) => {
        return (
          <Button
            className={cn(
              "justify-start",
              option.value === value ? "text-primary bg-accent" : undefined
            )}
            key={option.value}
            size="sm"
            variant="ghost"
            onClick={() => onChange?.(option.value)}
          >
            {option.value === OrderDirection.ASC ? <ArrowUp /> : <ArrowDown />}{" "}
            {option.label}
          </Button>
        );
      })}
    </div>
  );
};

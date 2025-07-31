import { FileText } from "lucide-react";
import { type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon = <FileText className="size-8" />,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="text-muted-foreground mx-auto">{icon}</div>

      {typeof title !== "undefined" && (
        <h3 className="text-muted-foreground mt-2 text-sm font-semibold">
          {title}
        </h3>
      )}

      {typeof description !== "undefined" && (
        <p className="mt-1 text-sm">{description}</p>
      )}
    </div>
  );
};

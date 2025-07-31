"use client";

import { forwardRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "prefix" | "suffix"> {
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefix, suffix, ...props }: InputProps, ref) => {
    const hasPrefix = !!prefix;
    const hasSuffix = !!suffix;

    return (
      <div
        className={cn(
          "relative flex w-full items-center",
          props.disabled && "cursor-not-allowed",
          className
        )}
      >
        {hasPrefix && (
          <span className="text-muted-foreground pointer-events-none absolute left-0 z-10 flex h-full items-center px-2">
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            hasPrefix ? "pl-7" : "pl-2",
            hasSuffix ? "pr-6" : "pr-2"
          )}
          {...props}
        />

        {hasSuffix && (
          <span className="text-muted-foreground pointer-events-none absolute right-0 z-10 flex h-full items-center px-2">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

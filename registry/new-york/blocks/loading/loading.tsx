"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({ className, size = "md" }: LoadingProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin",
        size === "sm" && "size-4",
        size === "md" && "size-6",
        size === "lg" && "size-8",
        className
      )}
    />
  );
}

"use client";

import { ComponentProps, forwardRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

import { Input } from "@/components/ui/input";

export type NumberInputProps = Omit<
  NumericFormatProps,
  "customInput" | "getInputRef"
> &
  ComponentProps<"input">;

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => {
    return <NumericFormat getInputRef={ref} customInput={Input} {...props} />;
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };

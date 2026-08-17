import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full">
        {label ? (
          <label className="text-[13px] font-sans font-medium text-ink mb-1.5">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          type={type}
          className={cn(
            "h-[46px] w-full rounded-md border-[0.5px] border-sand bg-white px-[14px] text-sm text-ink placeholder:text-ink-ghost transition-all duration-150 focus:outline-none focus:ring-[1.5px] focus:ring-sage-deep focus:border-sage-deep disabled:opacity-50 disabled:bg-cream/40",
            {
              "border-error focus:ring-error focus:border-error": error,
            },
            className
          )}
          {...props}
        />
        {error ? (
          <span className="text-[12px] font-sans font-normal text-error mt-1">
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

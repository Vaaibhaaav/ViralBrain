import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sage-deep disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
          // Variant mappings
          {
            "bg-sage-deep text-white hover:bg-[#345a3c] shadow-sm": variant === "primary",
            "border border-sand bg-transparent text-ink hover:bg-blush": variant === "secondary",
            "text-ink hover:bg-blush bg-transparent": variant === "ghost",
            "text-error border border-error bg-transparent hover:bg-[#FDF1EF]": variant === "destructive",
          },
          // Size mappings
          {
            "h-8 px-3 text-xs rounded-sm": size === "sm",
            "h-[46px] px-5 text-sm rounded-md": size === "md",
            "h-12 px-6 text-base rounded-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {isLoading && variant === "primary" ? "Loading..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

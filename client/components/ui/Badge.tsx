import React from "react";
import { cn } from "@/lib/utils";
import { Platform } from "@/lib/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "sage" | "amber" | "red" | "gray" | "platform";
  platform?: Platform;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "gray",
  platform,
  children,
  ...props
}) => {
  // Platform variant mapping
  const platformStyles: Record<Platform, string> = {
    tiktok: "bg-[#E8F4F8] text-[#0B5A7A]",
    instagram: "bg-[#FAE8F0] text-[#7A1840]",
    youtube: "bg-[#FAE8E8] text-[#7A1818]",
    twitter: "bg-[#E8EFF8] text-[#183A7A]",
    linkedin: "bg-[#E8EAF8] text-[#1E2A7A]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-sans font-medium rounded-sm tracking-wide uppercase",
        {
          "bg-sage/40 text-sage-deep": variant === "sage",
          "bg-amber/15 text-amber": variant === "amber",
          "bg-[#FDF1EF] text-error": variant === "red",
          "bg-blush text-ink-light border-[0.5px] border-sand/40": variant === "gray",
        },
        variant === "platform" && platform ? platformStyles[platform] : "",
        className
      )}
      {...props}
    >
      {variant === "platform" && platform && !children
        ? platform.charAt(0).toUpperCase() + platform.slice(1)
        : children}
    </span>
  );
};

export default Badge;

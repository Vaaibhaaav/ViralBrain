"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-2.5 py-1 text-[11px] font-sans font-medium text-cream shadow-premium animate-pulse-subtle",
            className
          )}
        >
          {content}
          <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-ink" />
        </div>
      )}
    </div>
  );
};

export default Tooltip;

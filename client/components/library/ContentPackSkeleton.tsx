"use client";

import React from "react";
import { Card } from "@/components/ui/Card";

export const ContentPackSkeleton: React.FC = () => {
  return (
    <Card className="flex flex-col justify-between p-5 bg-white border-[0.5px] border-sand/40 relative min-h-[200px] animate-pulse">
      {/* Top row: Status & Score */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="h-5 w-20 bg-sand/30 rounded" />
        <div className="h-5 w-8 bg-sand/30 rounded" />
      </div>

      {/* Center: Title description */}
      <div className="flex-1 mb-4 space-y-2 text-left">
        <div className="h-4 bg-sand/30 rounded w-full" />
        <div className="h-4 bg-sand/30 rounded w-5/6" />
        <div className="h-4 bg-sand/30 rounded w-2/3" />
      </div>

      {/* Footer: Platforms & Actions */}
      <div className="border-t-[0.5px] border-sand/20 pt-3.5 flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <div className="h-4.5 w-8 bg-sand/30 rounded" />
          <div className="h-4.5 w-8 bg-sand/30 rounded" />
          <div className="h-4.5 w-8 bg-sand/30 rounded" />
        </div>
        <div className="h-4.5 w-12 bg-sand/30 rounded" />
      </div>
    </Card>
  );
};

export default ContentPackSkeleton;

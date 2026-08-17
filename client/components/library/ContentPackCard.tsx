"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Eye } from "lucide-react";
import { ContentPack } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface ContentPackCardProps {
  pack: ContentPack;
}

export const ContentPackCard: React.FC<ContentPackCardProps> = ({ pack }) => {
  const { id, topic, created_at, status, virality_score, platforms } = pack;

  // Score color-coded background/text mappings
  const getScoreStyles = (score: number) => {
    if (score < 60) return "bg-[#FDF1EF] text-error border-error/20";
    if (score < 75) return "bg-amber/10 text-amber border-amber/20";
    return "bg-sage/40 text-sage-deep border-sage-deep/15";
  };

  const getStatusBadge = () => {
    switch (status) {
      case "generating":
        return <Badge variant="amber">Generating</Badge>;
      case "review":
        return <Badge variant="red">Needs Review</Badge>;
      case "approved":
        return <Badge variant="sage">Approved</Badge>;
      case "published":
        return (
          <Badge variant="sage" className="flex items-center gap-1">
            <CheckCircle2 size={10} />
            <span>Published</span>
          </Badge>
        );
    }
  };

  return (
    <Card 
      hoverLift 
      activeBorder={status === "review"}
      className="flex flex-col justify-between p-5 bg-white border-[0.5px] border-sand/40 relative hover:border-sand group select-none min-h-[200px]"
    >
      {/* Top row: Status & Score */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center">
          {getStatusBadge()}
        </div>
        
        {/* Dynamic score */}
        <span className={`font-mono text-sm font-bold border-[0.5px] px-2 py-0.5 rounded-sm shadow-sm ${getScoreStyles(virality_score)}`}>
          {virality_score}
        </span>
      </div>

      {/* Center: Title description */}
      <div className="flex-1 mb-4 text-left">
        <Link href={status === "generating" ? "/generate" : `/review/${id}`}>
          <h4 className="font-serif text-[17px] font-bold text-ink leading-snug tracking-tight hover:text-sage-deep transition-colors line-clamp-3">
            {topic}
          </h4>
        </Link>
      </div>

      {/* Footer: Platforms & Actions */}
      <div className="border-t-[0.5px] border-sand/20 pt-3.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {platforms.slice(0, 3).map((platform) => (
            <Badge key={platform} variant="platform" platform={platform} className="px-1 py-0 px-1.5 py-0 text-[9px] font-mono leading-none">
              {platform.substring(0, 2)}
            </Badge>
          ))}
          {platforms.length > 3 && (
            <span className="text-[10px] text-ink-ghost font-mono pl-0.5">
              +{platforms.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center">
          {status === "generating" ? (
            <Link
              href="/generate"
              className="text-xs font-semibold text-amber hover:underline flex items-center gap-0.5 font-sans"
            >
              <span>View</span>
              <ChevronRight size={14} />
            </Link>
          ) : status === "review" ? (
            <Link
              href={`/review/${id}`}
              className="text-xs font-semibold text-error hover:underline flex items-center gap-0.5 font-sans bg-[#FDF1EF] px-2.5 py-1 rounded-sm"
            >
              <span>Review</span>
              <ChevronRight size={14} />
            </Link>
          ) : (
            <Link
              href={`/review/${id}`}
              className="text-xs font-semibold text-sage-deep hover:underline flex items-center gap-0.5 font-sans"
            >
              <span>View</span>
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ContentPackCard;

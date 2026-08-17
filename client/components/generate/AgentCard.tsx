"use client";

import React from "react";
import { Check, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface AgentCardProps {
  agent: AgentStatus;
  onRetry?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onRetry }) => {
  const { name, description, status, progress, output_summary } = agent;

  return (
    <div
      className={cn(
        "border-[0.5px] border-sand/40 rounded-lg p-5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4",
        {
          "bg-parchment/40 opacity-70": status === "waiting",
          "bg-white shadow-premium border-sage-deep/30": status === "running",
          "bg-white/80 border-sand shadow-sm": status === "complete",
          "bg-error/5 border-error/30": status === "error",
        }
      )}
    >
      <div className="flex items-start gap-4 flex-1">
        {/* Left Dot / Icon status indicator */}
        <div className="mt-1 flex-shrink-0">
          {status === "waiting" && (
            <div className="h-4.5 w-4.5 rounded-full border border-sand bg-cream" />
          )}
          {status === "running" && (
            <div className="h-4.5 w-4.5 rounded-full bg-sage-deep animate-ping flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-white" />
            </div>
          )}
          {status === "complete" && (
            <div className="h-4.5 w-4.5 rounded-full bg-sage-deep text-white flex items-center justify-center p-0.5">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          )}
          {status === "error" && (
            <div className="h-4.5 w-4.5 rounded-full bg-error text-white flex items-center justify-center p-0.5 animate-bounce">
              <X className="h-3 w-3 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Text descriptions */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={cn("text-[13px] font-sans font-semibold tracking-wide", {
                "text-ink-ghost": status === "waiting",
                "text-sage-deep": status === "running",
                "text-ink": status === "complete",
                "text-error": status === "error",
              })}
            >
              {name}
            </h4>
            {status === "running" && (
              <span className="text-[11px] font-sans font-medium text-sage-deep italic animate-pulse">
                Running...
              </span>
            )}
          </div>
          <p
            className={cn("text-xs font-sans", {
              "text-ink-ghost": status === "waiting",
              "text-ink-light": status !== "waiting",
            })}
          >
            {description}
          </p>

          {/* Progress bar container */}
          {status === "running" && (
            <div className="w-full max-w-[320px] pt-1">
              <div className="h-1 bg-parchment rounded-sm overflow-hidden w-full">
                <div
                  className="h-full bg-sage-deep transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-ink-ghost mt-1 block">
                {progress}% complete
              </span>
            </div>
          )}

          {/* Output summary fade-in */}
          {status === "complete" && output_summary && (
            <div className="text-xs font-mono text-sage-deep bg-sage/20 border-[0.5px] border-sage-deep/10 rounded-sm py-1 px-2.5 max-w-fit mt-1 animate-fade-in">
              {output_summary}
            </div>
          )}
        </div>
      </div>

      {/* Action button if error */}
      {status === "error" && onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="text-xs h-8 border-error text-error hover:bg-error/5 flex items-center gap-1.5"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry</span>
        </Button>
      )}

      {/* Complete badge status on right */}
      {status === "complete" && (
        <span className="text-[11px] font-sans font-semibold text-sage-deep uppercase tracking-wider flex items-center justify-end">
          ✓ Complete
        </span>
      )}
    </div>
  );
};

export default AgentCard;

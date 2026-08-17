"use client";

import React from "react";
import { Brain, Database, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useUserStore } from "@/lib/userStore";

export const VoiceProfileStats: React.FC = () => {
  const { user } = useUserStore();
  const voiceVectors = user?.voice_vectors ?? 3840;

  const stats = [
    {
      icon: <Brain className="h-5 w-5 text-sage-deep" />,
      value: "47 Approved Posts",
      label: "in memory profile",
    },
    {
      icon: <Database className="h-5 w-5 text-sage-deep" />,
      value: `${voiceVectors.toLocaleString()} style vectors`,
      label: "multidimensional profile",
    },
    {
      icon: <RefreshCcw className="h-5 w-5 text-sage-deep animate-pulse-subtle" />,
      value: "Last updated 2h ago",
      label: "incremental learning active",
    },
  ];

  return (
    <div className="space-y-4 text-left select-none">
      <div className="border-b-[0.5px] border-sand/30 pb-2">
        <h4 className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase">
          Voice Memory Metrics
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white p-5 border-[0.5px] border-sand/40 rounded-lg flex items-start gap-3.5 shadow-sm">
            <div className="p-2 rounded-sm bg-sage/20 mt-0.5 flex-shrink-0">
              {stat.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-sans font-bold text-ink leading-tight">
                {stat.value}
              </span>
              <span className="text-[10px] text-ink-ghost uppercase tracking-wide font-medium mt-1">
                {stat.label}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-ink-light leading-relaxed font-sans bg-sage/10 border-[0.5px] border-sage-deep/10 p-3.5 rounded-md">
        💡 <span className="font-semibold text-sage-deep">Voice Profile tuning:</span> Your Voice Profile works by calculating semantic similarities between new drafts and approved archives. The more posts you approve, the more accurate the writing style adaptations become.
      </p>
    </div>
  );
};

export default VoiceProfileStats;

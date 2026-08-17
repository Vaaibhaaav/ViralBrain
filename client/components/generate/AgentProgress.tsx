"use client";

import React, { useState, useEffect } from "react";
import { useContentStore } from "@/lib/contentStore";
import AgentCard from "./AgentCard";

export const AgentProgress: React.FC = () => {
  const { agentProgress, viralityScoreTeaser } = useContentStore();
  const [displayedScore, setDisplayedScore] = useState(0);

  // Score rolling animation
  useEffect(() => {
    if (viralityScoreTeaser > 0) {
      let start = 0;
      const end = viralityScoreTeaser;
      const duration = 1200; // ms
      const intervalTime = 20; // ms
      const step = Math.ceil(end / (duration / intervalTime));

      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setDisplayedScore(end);
          clearInterval(timer);
        } else {
          setDisplayedScore(start);
        }
      }, intervalTime);

      return () => clearInterval(timer);
    } else {
      setDisplayedScore(0);
    }
  }, [viralityScoreTeaser]);

  // Determine score color classes
  const getScoreColorClass = (score: number) => {
    if (score < 60) return "text-error";
    if (score < 75) return "text-amber";
    return "text-sage-deep";
  };

  const getScoreRating = (score: number) => {
    if (score < 60) return "WEAK";
    if (score < 75) return "AVERAGE";
    return "STRONG";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* 8 Agent progression list (Left 2 columns) */}
      <div className="lg:col-span-2 space-y-4">
        {agentProgress.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Score gauge teaser (Right 1 column) */}
      <div className="lg:col-span-1 lg:sticky lg:top-20">
        {viralityScoreTeaser > 0 ? (
          <div className="bg-white border-[0.5px] border-sand p-8 rounded-lg shadow-premium text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <span className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase">
              Virality Score
            </span>
            
            <div className="flex flex-col items-center">
              {/* Score number */}
              <span className={`font-mono text-6xl font-bold tracking-tight ${getScoreColorClass(displayedScore)}`}>
                {displayedScore}
              </span>
              
              {/* Separator */}
              <div className="w-16 h-[0.5px] bg-sand my-3" />
              
              {/* Rating level */}
              <span className={`text-[11px] font-mono font-bold tracking-widest ${getScoreColorClass(displayedScore)}`}>
                {getScoreRating(displayedScore)}
              </span>
            </div>
            
            <p className="text-xs text-ink-light font-sans max-w-[200px]">
              This score measures hook strength, platform adaptability, and style coherence.
            </p>
          </div>
        ) : (
          <div className="bg-parchment/40 border-[0.5px] border-dashed border-sand/60 p-8 rounded-lg text-center flex flex-col items-center justify-center min-h-[220px]">
            <span className="text-xs text-ink-ghost font-sans italic">
              Awaiting Virality Scorer Agent...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentProgress;

"use client";

import React, { useState, useEffect } from "react";
import { BrainCircuit, Sparkles, Cpu, ShieldCheck, Zap, Activity } from "lucide-react";

interface Stage {
  code: string;
  label: string;
  detail: string;
  icon: React.ElementType;
}

const PROCESSOR_STAGES: Stage[] = [
  {
    code: "INTENT_PARSE",
    label: "Parsing intent & query semantics...",
    detail: "NLP Classifier • Intent Vector",
    icon: BrainCircuit,
  },
  {
    code: "RETENTION_VECTOR",
    label: "Analyzing virality & retention vectors...",
    detail: "Hook Score • Curiosity Gap Audit",
    icon: Activity,
  },
  {
    code: "AUDIENCE_DIAL",
    label: "Auditing niche cohort benchmarks...",
    detail: "Target Demographics • Market Alignment",
    icon: Zap,
  },
  {
    code: "GUARDRAIL_AUDIT",
    label: "Verifying safety & groundedness guardrails...",
    detail: "Fact Grounding • Safety Check",
    icon: ShieldCheck,
  },
  {
    code: "VOICE_MATCH",
    label: "Matching creator tone & format vectors...",
    detail: "Voice Profile Engine • Persona Adaptation",
    icon: Cpu,
  },
  {
    code: "SYNTHESIS_MATRIX",
    label: "Synthesizing AI response payload...",
    detail: "Multi-Agent Consensus Layer",
    icon: Sparkles,
  },
];

export const LoadingProcessor: React.FC = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [latency, setLatency] = useState(28);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prevIndex) => (prevIndex + 1) % PROCESSOR_STAGES.length);
      setLatency(30 + Math.floor(Math.random() * 25));
    }, 850);

    return () => clearInterval(stageInterval);
  }, []);

  const activeStage = PROCESSOR_STAGES[currentStageIndex];
  const IconComponent = activeStage.icon;
  const progressPercent = Math.min(100, Math.round(((currentStageIndex + 1) / PROCESSOR_STAGES.length) * 100));

  return (
    <div className="w-full space-y-2.5 p-3.5 bg-gradient-to-br from-cream/90 via-white to-parchment/60 border-[0.5px] border-sage-deep/20 rounded-xl shadow-xs text-left animate-fade-in font-sans select-none overflow-hidden relative">
      {/* Background Subtle Pulsing Glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-sage/20 rounded-full blur-xl animate-pulse pointer-events-none" />

      {/* Top Processor Status Bar */}
      <div className="flex items-center justify-between border-b-[0.5px] border-sand/30 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-sage-deep/20 animate-ping" />
            <div className="w-5 h-5 rounded-full bg-sage-deep/10 border border-sage-deep/30 flex items-center justify-center">
              <BrainCircuit className="w-3 h-3 text-sage-deep animate-pulse" />
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold tracking-tight text-sage-deep uppercase flex items-center gap-1.5">
            AI Engine Processing
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-ink-ghost">
          <span className="bg-sand/30 px-1.5 py-0.5 rounded text-[9.5px]">
            {latency}ms
          </span>
          <span className="text-sage-deep font-semibold">
            {currentStageIndex + 1}/{PROCESSOR_STAGES.length}
          </span>
        </div>
      </div>

      {/* Round-Robin Active Stage Message */}
      <div className="py-1 min-h-[44px] flex flex-col justify-center transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-2 mb-1">
          <IconComponent className="w-3.5 h-3.5 text-sage-deep flex-shrink-0 animate-bounce" />
          <span className="text-xs font-semibold text-ink leading-tight tracking-tight">
            {activeStage.label}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-ink-ghost pl-5">
          <span className="truncate">{activeStage.detail}</span>
          <span className="bg-sage/40 text-sage-deep px-1.5 py-0.2 rounded font-bold text-[9px]">
            {activeStage.code}
          </span>
        </div>
      </div>

      {/* Dynamic Animated Progress Bar */}
      <div className="w-full bg-sand/30 h-1.5 rounded-full overflow-hidden relative">
        <div
          className="bg-gradient-to-r from-sage-deep via-emerald-600 to-sage-deep h-full rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Shimmer sweep effect over progress bar */}
          <div className="absolute inset-0 bg-white/40 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default LoadingProcessor;

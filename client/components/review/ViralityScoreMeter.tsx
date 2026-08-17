"use client";

import React, { useEffect, useState } from "react";

interface ViralityScoreMeterProps {
  score: number;
}

export const ViralityScoreMeter: React.FC<ViralityScoreMeterProps> = ({ score }) => {
  const [offset, setOffset] = useState(251.3); // Length of semicircle (PI * R = 3.14159 * 80)
  
  const circumference = 251.3;
  const targetOffset = circumference - (circumference * Math.min(Math.max(score, 0), 100)) / 100;

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => {
      setOffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [targetOffset]);

  // Color-coded mapping
  const getColor = (s: number) => {
    if (s < 60) return "#C94C3A"; // --error
    if (s < 75) return "#D4820A"; // --amber
    return "#3E6B47"; // --sage-deep
  };

  const getLabel = (s: number) => {
    if (s < 60) return "WEAK";
    if (s < 75) return "AVERAGE";
    return "STRONG";
  };

  const strokeColor = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-white rounded-lg border-[0.5px] border-sand/40 shadow-sm w-full max-w-[240px] mx-auto select-none">
      <span className="text-[10px] font-sans font-bold text-ink-ghost tracking-wider uppercase">
        Virality Potential
      </span>

      <div className="relative h-28 w-44 flex items-center justify-center overflow-hidden">
        {/* SVG Semicircle Gauge */}
        <svg className="w-full h-full transform -rotate-180" viewBox="0 0 180 100">
          {/* Background Track */}
          <path
            d="M 10 90 A 80 80 0 0 1 170 90"
            fill="none"
            stroke="#EFE9DF"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Active Fill Track */}
          <path
            d="M 10 90 A 80 80 0 0 1 170 90"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-[1200ms] ease-out"
          />
        </svg>

        {/* Floating Center Score */}
        <div className="absolute bottom-12 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold tracking-tight text-ink">
            {score}
          </span>
          <span
            className="text-[9px] font-mono font-bold tracking-widest mt-1 uppercase"
            style={{ color: strokeColor }}
          >
            {getLabel(score)}
          </span>
        </div>
      </div>
      
      <p className="text-[10px] font-sans text-ink-ghost text-center leading-normal">
        Based on hook velocity, readability index, and formatting meta analysis.
      </p>
    </div>
  );
};

export default ViralityScoreMeter;

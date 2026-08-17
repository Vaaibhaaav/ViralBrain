"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Paintbrush, Smile, Type } from "lucide-react";
import { ThumbnailBrief as BriefType } from "@/lib/types";

interface ThumbnailBriefProps {
  brief: BriefType;
  onChangeOverlay?: (large: string, small: string) => void;
}

export const ThumbnailBrief: React.FC<ThumbnailBriefProps> = ({
  brief,
  onChangeOverlay,
}) => {
  const [largeText, setLargeText] = useState(brief.textOverlay.large);
  const [smallText, setSmallText] = useState(brief.textOverlay.small);

  const handleLargeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLargeText(e.target.value);
    if (onChangeOverlay) onChangeOverlay(e.target.value, smallText);
  };

  const handleSmallChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSmallText(e.target.value);
    if (onChangeOverlay) onChangeOverlay(largeText, e.target.value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-left select-none">
      {/* Visual Canvas Mock Preview (Left 1 column) */}
      <div className="md:col-span-1 space-y-3">
        <label className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase block">
          Canvas Mock
        </label>
        
        {/* The visual box */}
        <div 
          className="aspect-video w-full rounded-lg border-[0.5px] border-sand/40 relative flex flex-col justify-between p-4 shadow-sm overflow-hidden select-none"
          style={{ backgroundColor: brief.colors[2] || "#F7F4EF" }}
        >
          {/* Subtle design element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sage/30 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
          
          {/* Top text overlay */}
          <div className="z-10 flex flex-col">
            <span 
              className="text-[9px] font-mono font-bold tracking-widest uppercase"
              style={{ color: brief.colors[0] || "#3E6B47" }}
            >
              {smallText || "VIRALBRAIN CONCEPT"}
            </span>
          </div>

          {/* Large display text overlay */}
          <div className="z-10 mt-auto">
            <h4 
              className="font-serif text-xl md:text-2xl font-bold leading-tight tracking-tight uppercase"
              style={{ color: brief.colors[3] || "#1A1A18" }}
            >
              {largeText || "YOUR CONTENT TITLE"}
            </h4>
          </div>
        </div>

        <p className="text-[10px] text-ink-ghost font-sans italic text-center">
          Visual preview of visual contrast and overlay alignments.
        </p>
      </div>

      {/* Structured outline details (Right 2 columns) */}
      <div className="md:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm">
          {/* Concept summary */}
          <div className="sm:col-span-2 space-y-2">
            <h4 className="text-xs font-sans font-bold text-ink flex items-center gap-1.5 border-b-[0.5px] border-sand/20 pb-1">
              <ImageIcon size={14} className="text-ink-light" />
              <span>Background Concept</span>
            </h4>
            <p className="text-xs text-ink-light leading-relaxed font-sans">
              {brief.concept}
            </p>
          </div>

          {/* Editable text overlay inputs */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-sans font-bold text-ink flex items-center gap-1.5 border-b-[0.5px] border-sand/20 pb-1">
              <Type size={14} className="text-ink-light" />
              <span>Text Overlays</span>
            </h4>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-sans font-bold text-ink-ghost uppercase mb-1">Small text</span>
                <input
                  type="text"
                  value={smallText}
                  onChange={handleSmallChange}
                  className="px-2.5 h-8 border-[0.5px] border-sand/40 rounded-sm text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-sans font-bold text-ink-ghost uppercase mb-1">Large headline</span>
                <input
                  type="text"
                  value={largeText}
                  onChange={handleLargeChange}
                  className="px-2.5 h-8 border-[0.5px] border-sand/40 rounded-sm text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep"
                />
              </div>
            </div>
          </div>

          {/* Color swatches */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-sans font-bold text-ink flex items-center gap-1.5 border-b-[0.5px] border-sand/20 pb-1">
              <Paintbrush size={14} className="text-ink-light" />
              <span>Color Swatches</span>
            </h4>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                {brief.colors.map((color, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div 
                      className="h-6 w-6 rounded-full border-[0.5px] border-sand/30 shadow-inner" 
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                    <span className="text-[8px] font-mono text-ink-ghost mt-1 uppercase">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-ink-ghost font-sans italic block pt-1">
                Ref: {brief.referenceStyle}
              </span>
            </div>
          </div>

          {/* Expression notes */}
          <div className="sm:col-span-2 space-y-2">
            <h4 className="text-xs font-sans font-bold text-ink flex items-center gap-1.5 border-b-[0.5px] border-sand/20 pb-1">
              <Smile size={14} className="text-ink-light" />
              <span>Subject Expression Note</span>
            </h4>
            <p className="text-xs text-ink-light leading-relaxed font-sans bg-cream/35 p-3 rounded-sm border-[0.5px] border-sand/20">
              {brief.expression}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailBrief;

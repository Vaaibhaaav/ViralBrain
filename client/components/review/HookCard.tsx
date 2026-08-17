"use client";

import React, { useState, useEffect, useRef } from "react";
import { Copy, Check, Star } from "lucide-react";
import { Hook } from "@/lib/types";
import { useContentStore } from "@/lib/contentStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface HookCardProps {
  packId: string;
  hooks: Hook[];
}

export const HookCard: React.FC<HookCardProps> = ({ packId, hooks }) => {
  const promoteHook = useContentStore((state) => state.promoteHook);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, hooks.length);
  }, [hooks]);

  // Handle keyboard navigation (Arrow Keys)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    const cols = 2; // 2 column layout
    const rows = Math.ceil(hooks.length / cols);

    switch (e.key) {
      case "ArrowRight":
        if (index < hooks.length - 1) {
          nextIndex = index + 1;
          e.preventDefault();
        }
        break;
      case "ArrowLeft":
        if (index > 0) {
          nextIndex = index - 1;
          e.preventDefault();
        }
        break;
      case "ArrowDown":
        if (index + cols < hooks.length) {
          nextIndex = index + cols;
          e.preventDefault();
        }
        break;
      case "ArrowUp":
        if (index - cols >= 0) {
          nextIndex = index - cols;
          e.preventDefault();
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        handleSetPrimary(hooks[index].id);
        break;
      default:
        return;
    }

    if (nextIndex !== index) {
      setFocusedIndex(nextIndex);
      cardRefs.current[nextIndex]?.focus();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSetPrimary = (hookId: string) => {
    promoteHook(packId, hookId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-sans font-bold text-ink-ghost tracking-wider uppercase">
          A/B Hook Variants
        </h3>
        <span className="text-[11px] font-sans text-ink-ghost italic">
          Use arrow keys to navigate · Press Enter to set primary
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hooks.map((hook, index) => {
          const isTop = hook.is_top;
          const isFocused = index === focusedIndex;

          return (
            <div
              key={hook.id}
              ref={(el) => { cardRefs.current[index] = el; }}
              tabIndex={0}
              onFocus={() => setFocusedIndex(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`rounded-lg border-[0.5px] p-5 bg-white text-ink transition-all duration-150 relative outline-none flex flex-col justify-between min-h-[140px] ${
                isTop 
                  ? "border-sage-deep/40 shadow-sm ring-1 ring-sage-deep/20" 
                  : "border-sand/40 hover:border-sand"
              } ${
                isFocused 
                  ? "ring-2 ring-sage-deep border-sage-deep" 
                  : ""
              }`}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-ink-light uppercase bg-cream/80 px-2.5 py-0.5 rounded-sm border-[0.5px] border-sand/20">
                    Variant {hook.variant?.toUpperCase() || (index === 0 ? "A" : "B")}
                  </span>
                  <span className="text-xs font-mono font-semibold text-sage-deep">
                    Score: {hook.score}%
                  </span>
                </div>
                {isTop && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-sage-deep bg-sage px-2 py-0.5 rounded-sm uppercase tracking-wide">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    <span>Primary</span>
                  </span>
                )}
              </div>

              {/* Hook content */}
              <p className="text-sm font-sans text-ink leading-relaxed mb-4">
                &ldquo;{hook.text}&rdquo;
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 border-t-[0.5px] border-sand/20 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(hook.id, hook.text)}
                  className="h-8 text-xs font-semibold px-2 hover:bg-blush flex items-center gap-1 text-ink-light"
                >
                  {copiedId === hook.id ? (
                    <>
                      <Check className="h-3 w-3 text-sage-deep" />
                      <span className="text-sage-deep">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>

                {!isTop && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSetPrimary(hook.id)}
                    className="h-8 text-xs font-semibold px-3 hover:bg-blush"
                  >
                    Set as Primary
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HookCard;

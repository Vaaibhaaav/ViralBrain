"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { useContentStore } from "@/lib/contentStore";
import AgentProgress from "@/components/generate/AgentProgress";
import { Button } from "@/components/ui/Button";


const AUTO_REDIRECT_DELAY_MS = 1200;

export default function GeneratePage() {
  const router = useRouter();
  const { activePack, isGenerating } = useContentStore();
  const [isReady, setIsReady] = useState(false);

  const hasStartedGenerating = useRef(false);

  useEffect(() => {
    if (isGenerating) {
      hasStartedGenerating.current = true;
    }
  }, [isGenerating]);

  const isComplete = hasStartedGenerating.current && !isGenerating && !!activePack;

  useEffect(() => {
    if (!isComplete || !activePack) return;

    setIsReady(true);
    const timer = setTimeout(() => {
      router.push(`/review/${activePack.id}`);
    }, AUTO_REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isComplete, activePack, router]);

  const handleManualRedirect = () => {
    if (activePack) {
      router.push(`/review/${activePack.id}`);
    }
  };

  const topicName = activePack ? activePack.topic : "Your new content idea";

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[0.5px] border-sand/40 pb-5">
        <div>
          <h1 className="font-serif text-[28px] font-bold text-ink leading-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-sage-deep animate-pulse" />
            <span>Generating your content pack</span>
          </h1>
          <p className="mt-2 text-[13px] text-ink-light font-sans max-w-[550px]">
            The ViralBrain agent fleet is analyzing search algorithms, adapting
            structures, scoring hooks, and building native variations.
          </p>
        </div>

        {isReady && (
          <Button
            onClick={handleManualRedirect}
            className="bg-sage-deep text-white hover:bg-sage-deep/90 text-xs px-4 h-9 font-semibold flex items-center gap-1.5 animate-fade-in"
          >
            <span>Pack ready</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="bg-white border-[0.5px] border-sand p-4 rounded-lg shadow-sm">
        <span className="text-[10px] font-sans font-bold text-ink-ghost tracking-wider uppercase block mb-1">
          Input Topic
        </span>
        <blockquote className="font-serif italic text-base text-ink leading-relaxed">
          &ldquo;{topicName}&rdquo;
        </blockquote>
      </div>

      <AgentProgress />
    </div>
  );
}
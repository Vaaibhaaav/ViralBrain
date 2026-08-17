"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Sliders } from "lucide-react";
import { useContentStore } from "@/lib/contentStore";
import { useChatStore } from "@/lib/chatStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Platform } from "@/lib/types";

export const IdeaInput: React.FC = () => {
  const router = useRouter();
  const { userProfile, createPack, isGenerating } = useContentStore();
  const triggerProactiveMessage = useChatStore((state) => state.triggerProactiveMessage);

  const defaults = userProfile.default_settings;

  // Form states
  const [topic, setTopic] = useState("");
  const [topicDetails, setTopicDetails] = useState("");
  const [niche, setNiche] = useState("");
  const [language, setLanguage] = useState("");
  const [audience, setAudience] = useState("");
  const [primaryPlatform, setPrimaryPlatform] = useState<Platform>("youtube");
  const [personalized, setPersonalized] = useState(true);

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "tiktok",
    "instagram",
    "youtube",
    "twitter",
  ]);

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Pre-load defaults from profile settings on mount
  useEffect(() => {
    if (defaults) {
      setTopicDetails(defaults.topic_details || "");
      setNiche(defaults.niche || "");
      setLanguage(defaults.preferred_language || "English");
      setAudience(defaults.target_audience || "");
      setPrimaryPlatform(defaults.primary_platform || "youtube");
      setPersonalized(defaults.preferred_personalized_output !== undefined ? defaults.preferred_personalized_output : true);
    }
  }, [defaults]);

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length === 1) return; // Keep at least one platform
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleGenerate = async () => {
    // if (topic.length < 20) return;

    if(isGenerating)return;

    // Route first so user sees progress screen immediately
    router.push("/generate");

    // Initiate store generator with detailed parameters
    createPack(
      topic,
      {
        topic_details: topicDetails,
        niche,
        preferred_language: language,
        target_audience: audience,
        primary_platform: primaryPlatform,
        preferred_personalized_output: personalized,
      },
      selectedPlatforms,
      undefined, // step callback
      (newId) => {
        // Completion callback
        setTimeout(() => {
          triggerProactiveMessage(
            "Your pack is ready! The A/B Hook #1 looks especially strong for YouTube.",
            "pack_preview",
            { label: "Review Pack", href: `/review/${newId}` }
          );
        }, 1000);
      }
    );
  };

  const platforms: { id: Platform; label: string }[] = [
    { id: "tiktok", label: "TikTok" },
    { id: "instagram", label: "Instagram" },
    { id: "youtube", label: "YouTube" },
    { id: "twitter", label: "Twitter" },
    { id: "linkedin", label: "LinkedIn" },
  ];

  return (
    <Card className="w-full bg-white p-6 md:p-8 border-[0.5px] border-sand shadow-premium rounded-lg text-left select-none">
      <div className="flex flex-col space-y-5">

        {/* Main Topic Input */}
        <div className="space-y-2">
          <label className="text-[15px] font-sans font-medium text-ink">
            What&apos;s your next piece of content about?
          </label>
          <div className="relative border-[0.5px] border-sand/40 focus-within:border-sage-deep focus-within:ring-1 focus-within:ring-sage-deep rounded-md transition-all duration-150 p-2 bg-cream/10">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value.slice(0, 280))}
              placeholder='e.g. "Why most creators quit at 10k followers — and the mindset shift that changes everything"'
              className="w-full min-h-[100px] text-base text-ink bg-transparent border-none outline-none resize-none placeholder:text-ink-ghost px-2 py-1 font-sans"
              maxLength={280}
            />
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-ink-ghost">
              {topic.length} / 280
            </div>
          </div>
        </div>

        {/* Advanced input settings collapsible button */}
        <div className="flex justify-start pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1.5 text-xs text-sage-deep font-semibold hover:text-[#345a3c] transition-colors"
          >
            <Sliders size={14} className={showAdvanced ? "rotate-90 transition-transform" : "transition-transform"} />
            <span>{showAdvanced ? "Hide advanced generation settings" : "Configure advanced generation settings"}</span>
          </button>
        </div>

        {/* Collapsible advanced section */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-md bg-cream/30 border-[0.5px] border-sand/30 animate-fade-in">
            {/* Topic Details input (Max length not very much - e.g. 150) */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-sans font-bold text-ink-ghost uppercase tracking-wide">
                Topic details (optional - max 150 chars)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topicDetails}
                  onChange={(e) => setTopicDetails(e.target.value.slice(0, 150))}
                  placeholder="e.g. Share the structural shift from trading hours to designing operating systems."
                  className="w-full h-10 rounded border-[0.5px] border-sand/40 bg-white px-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep focus:border-sage-deep"
                />
                <span className="absolute right-2.5 top-3 text-[9px] font-mono text-ink-ghost">
                  {topicDetails.length} / 150
                </span>
              </div>
            </div>

            {/* Niche */}
            <Input
              type="text"
              label="Niche / Category"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Solopreneurship"
              className="h-10 text-xs rounded"
            />

            {/* Target Audience */}
            <Input
              type="text"
              label="Target Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Mid-tier creators (5k to 20k)"
              className="h-10 text-xs rounded"
            />

            {/* Preferred Language */}
            <Input
              type="text"
              label="Preferred Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. English"
              className="h-10 text-xs rounded"
            />

            {/* Primary Platform & Personalized Checkbox */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Primary Platform Select */}
              <div className="flex flex-col flex-1 min-w-0">
                <label className="text-[13px] font-sans font-medium text-ink mb-1.5">
                  Primary Platform
                </label>
                <select
                  value={primaryPlatform}
                  onChange={(e) => setPrimaryPlatform(e.target.value as Platform)}
                  className="px-3 h-10 bg-white border-[0.5px] border-sand/40 rounded text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep hover:bg-blush transition-colors"
                >
                  {platforms.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Personalized checkbox */}
              <div className="flex items-center gap-2 pt-5 sm:pt-6">
                <input
                  type="checkbox"
                  id="personalized"
                  checked={personalized}
                  onChange={(e) => setPersonalized(e.target.checked)}
                  className="h-4 w-4 accent-sage-deep rounded cursor-pointer"
                />
                <label htmlFor="personalized" className="text-xs font-sans font-medium text-ink-light cursor-pointer select-none">
                  Learns my voice profile
                </label>
              </div>
            </div>

          </div>
        )}

        {/* Footer controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t-[0.5px] border-sand/20">
          {/* Platforms row selector */}
          <div className="flex flex-col space-y-1.5">
            <span className="text-[10px] font-sans font-bold text-ink-ghost tracking-wider uppercase">
              Distribution Channels
            </span>
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`px-3 py-1 text-xs rounded-pill border-[0.5px] font-medium tracking-wide transition-all ${isSelected
                        ? "bg-sage border-sage-deep text-sage-deep font-semibold"
                        : "bg-white border-sand/40 text-ink-light hover:bg-blush"
                      }`}
                  >
                    {p.label} {isSelected ? "✓" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-end justify-end">
            <Button
              onClick={handleGenerate}
              disabled = {isGenerating}
              className="px-6 h-[46px] rounded-md flex items-center gap-2 group"
            >
              <Sparkles className="h-4 w-4 animate-pulse-subtle group-hover:rotate-12 transition-transform" />
              <span>Generate Pack</span>
            </Button>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default IdeaInput;

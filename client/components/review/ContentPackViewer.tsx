"use client";

import React, { useState } from "react";
import { Platform, ContentPack } from "@/lib/types";
import HookCard from "./HookCard";
import ThumbnailBrief from "./ThumbnailBrief";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  Calendar, Clock, FileText, Sparkles, Copy, Check, Globe,
  Type, Hash, Award, ThumbsUp, MessageSquare, Repeat, Heart, Send, Eye
} from "lucide-react";

interface ContentPackViewerProps {
  pack: ContentPack;
  isEditing: boolean;
  onUpdatePack: (updated: ContentPack) => void;
}

export const ContentPackViewer: React.FC<ContentPackViewerProps> = ({
  pack,
  isEditing,
  onUpdatePack,
}) => {
  const [activeTab, setActiveTab] = useState<string>("script");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Script parser
  const pacingStrategy = pack.script_draft?.match(/### 📊 PACING STRATEGY:\s*([^\n]+)/i)?.[1] || "Normal Pacing";
  const estimatedDuration = pack.script_draft?.match(/⏱️ ESTIMATED DURATION:\s*([^\n]+)/i)?.[1] || "60s";

  const getScriptBlocks = () => {
    const text = pack.script_draft || "";
    if (text.includes('[HOOK]') || text.includes('[BODY]') || text.includes('[CTA]')) {
      const hookMatch = text.match(/\[HOOK\]([\s\S]*?)(?=\n\n\[BODY\]|\[BODY\]|$)/i);
      const bodyMatch = text.match(/\[BODY\]([\s\S]*?)(?=\n\n\[CTA\]|\[CTA\]|$)/i);
      const ctaMatch = text.match(/\[CTA\]([\s\S]*?)$/i);
      return [
        { type: "header" as const, text: "Formatted Script Sections" },
        { type: "visual" as const, text: `[Hook] — First 3 Seconds: ${hookMatch ? hookMatch[1].trim() : ""}` },
        { type: "audio" as const, text: `[Body] — Key Value: ${bodyMatch ? bodyMatch[1].trim() : ""}`, details: "Body" },
        { type: "audio" as const, text: `[CTA] — Call to Action: ${ctaMatch ? ctaMatch[1].trim() : ""}`, details: "CTA" },
      ];
    }

    const lines = text.split("\n");
    const blocks: { type: "visual" | "audio" | "header" | "text"; text: string; details?: string }[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("###") || trimmed.startsWith("⏱️") || trimmed.startsWith("---")) return;

      if (trimmed.startsWith("🎬 VISUAL:")) {
        blocks.push({
          type: "visual",
          text: trimmed.replace("🎬 VISUAL:", "").trim(),
        });
      } else if (trimmed.startsWith("🎙️ AUDIO")) {
        const audioMatch = trimmed.match(/🎙️ AUDIO\s*(?:\(([^)]+)\))?\s*:\s*(.*)/i);
        if (audioMatch) {
          blocks.push({
            type: "audio",
            text: audioMatch[2].replace(/^"(.*)"$/, "$1").trim(),
            details: audioMatch[1] || "High Energy",
          });
        } else {
          blocks.push({
            type: "audio",
            text: trimmed.replace(/^🎙️ AUDIO\s*:\s*/i, "").trim(),
            details: "High Energy",
          });
        }
      } else {
        blocks.push({
          type: "text",
          text: trimmed,
        });
      }
    });

    return blocks;
  };

  const handleScriptRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdatePack({
      ...pack,
      script_draft: e.target.value,
    });
  };

  const handleThumbnailOverlayChange = (large: string, small: string) => {
    if (!pack.thumbnail_brief) return;
    onUpdatePack({
      ...pack,
      thumbnail_brief: {
        ...pack.thumbnail_brief,
        textOverlay: { large, small },
      },
    });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Build tabs dynamically
  const tabs = [{ id: "script", label: "Script" }];

  const hasTitles = pack.title_packaging && pack.title_packaging.length > 0;
  if (hasTitles) {
    tabs.push({ id: "titles", label: "A/B Titles" });
  }

  tabs.push({ id: "hooks", label: "A/B Hooks" });

  const hasLinkedin = pack.linkedin_copy || (pack.captions && pack.captions.linkedin);
  if (hasLinkedin) {
    tabs.push({ id: "linkedin", label: "LinkedIn" });
  }

  const hasTwitter = pack.twitter_thread_payload && pack.twitter_thread_payload.length > 0;
  if (hasTwitter) {
    tabs.push({ id: "twitter", label: "Twitter Thread" });
  }

  const hasSeo = pack.seo_indexing;
  if (hasSeo) {
    tabs.push({ id: "seo", label: "SEO Indexing" });
  }

  if (pack.thumbnail_brief) {
    tabs.push({ id: "thumbnail", label: "Thumbnail" });
  }

  if (pack.schedule && Object.keys(pack.schedule).length > 0) {
    tabs.push({ id: "schedule", label: "Schedule" });
  }

  return (
    <div className="space-y-6">
      {/* Tabs list */}
      <div className="border-b-[0.5px] border-sand/40 overflow-x-auto select-none flex scrollbar-none">
        <div className="flex space-x-1 py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-xs font-sans font-semibold tracking-wide uppercase border-b-2 border-transparent transition-all hover:text-ink whitespace-nowrap",
                  isActive
                    ? "border-sage-deep text-sage-deep"
                    : "text-ink-ghost"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "script" && (
        <div className="h-[calc(100vh-50px)] overflow-y-auto no-scrollbar space-y-6 bg-white border-[0.5px] border-sand p-6 md:p-8 rounded-lg shadow-sm text-left">
          <div className="flex items-center justify-between border-b-[0.5px] border-sand/20 pb-3">
            <h3 className="text-xs font-sans font-bold text-ink-ghost tracking-wider uppercase flex items-center gap-1.5">
              <FileText size={14} />
              <span>Full Video Script Draft</span>
            </h3>

            <div className="flex items-center gap-3">
              <Badge variant="gray" className="font-mono text-[10px]">Pacing: {pacingStrategy}</Badge>
              <div className="flex items-center gap-1 font-mono text-[11px] text-ink-ghost">
                <Clock size={12} />
                <span>Duration: {estimatedDuration}</span>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <span className="text-[10px] font-sans font-bold text-ink-ghost uppercase">Edit Full Script Draft</span>
              <textarea
                value={pack.script_draft}
                onChange={handleScriptRawChange}
                className="w-full min-h-[350px] p-4 text-sm text-ink bg-cream/10 border-[0.5px] border-sand/40 rounded-md focus:outline-none focus:ring-1 focus:ring-sage-deep font-mono leading-relaxed resize-y"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {getScriptBlocks().map((block, idx) => {
                if (block.type === "visual") {
                  return (
                    <div key={idx} className="bg-cream/20 border-[0.5px] border-sand/30 rounded-md p-3.5 flex gap-3 text-left">
                      <span className="text-base flex-shrink-0">🎬</span>
                      <div>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-ink-ghost uppercase block mb-1">
                          Visual Cue
                        </span>
                        <p className="text-xs font-sans text-ink-light leading-relaxed">
                          {block.text}
                        </p>
                      </div>
                    </div>
                  );
                } else if (block.type === "audio") {
                  return (
                    <div key={idx} className="bg-sage/10 border-[0.5px] border-sage-deep/10 rounded-md p-4 flex gap-3 text-left relative">
                      <span className="text-base flex-shrink-0">🎙️</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-sage-deep uppercase">
                            Audio Track ({block.details})
                          </span>
                        </div>
                        <p className="text-sm font-sans text-ink font-semibold leading-relaxed">
                          &ldquo;{block.text}&rdquo;
                        </p>
                      </div>
                    </div>
                  );
                } else if (block.type === "header") {
                  return (
                    <h4 key={idx} className="text-xs font-sans font-bold text-ink-ghost uppercase tracking-wider pt-2 border-b-[0.5px] border-sand/10 pb-1">
                      {block.text}
                    </h4>
                  );
                } else {
                  return (
                    <p key={idx} className="text-sm text-ink-light leading-relaxed pl-1">
                      {block.text}
                    </p>
                  );
                }
              })}
            </div>
          )}
        </div>
      )}

      {/* A/B Titles Tab */}
      {activeTab === "titles" && hasTitles && (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b-[0.5px] border-sand/20 pb-3">
            <h3 className="text-sm font-sans font-bold text-ink-ghost tracking-wider uppercase flex items-center gap-1.5">
              <Type size={14} />
              <span>A/B Title packaging variants</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {pack.title_packaging?.map((item, index) => (
              <div
                key={index}
                className="bg-white border-[0.5px] border-sand rounded-lg p-5 flex items-center justify-between gap-4 shadow-sm hover:border-sage-deep/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wide text-sage-deep bg-sage px-2 py-0.5 rounded-sm">
                    {item.psychology_type}
                  </span>
                  <p className="font-serif text-lg font-bold text-ink leading-snug truncate pt-1">
                    {item.title}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 px-3 text-xs font-semibold flex items-center gap-1 text-ink-light flex-shrink-0"
                  onClick={() => copyToClipboard(item.title, index)}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-sage-deep" />
                      <span className="text-sage-deep">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A/B Hooks tab */}
      {activeTab === "hooks" && (
        <HookCard packId={pack.id} hooks={pack.hooks || []} />
      )}

      {/* LinkedIn Post Tab */}
      {activeTab === "linkedin" && hasLinkedin && (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b-[0.5px] border-sand/20 pb-3">
            <h3 className="text-sm font-sans font-bold text-ink-ghost tracking-wider uppercase flex items-center gap-1.5">
              <Award size={14} />
              <span>LinkedIn Copy Mock Preview</span>
            </h3>
          </div>

          <div className="bg-white border-[0.5px] border-sand rounded-lg p-6 max-w-xl mx-auto shadow-sm space-y-4">
            {/* User Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sage-deep text-white font-serif flex items-center justify-center font-bold text-sm">
                SK
              </div>
              <div className="leading-tight">
                <h4 className="font-sans font-bold text-sm text-ink hover:underline cursor-pointer">Sarah K. (You)</h4>
                <p className="font-sans text-[11px] text-ink-ghost">Founder & Creator @ ViralBrain</p>
                <p className="font-sans text-[10px] text-ink-ghost flex items-center gap-0.5 mt-0.5">
                  <span>1h ·</span>
                  <Globe className="h-3 w-3" />
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="space-y-3 font-sans text-[13px] text-ink leading-relaxed whitespace-pre-wrap">
              {pack.linkedin_copy || (pack.captions && pack.captions.linkedin)}
            </div>

            {/* Reactions matrix */}
            <div className="border-t-[0.5px] border-sand/20 pt-3 flex items-center justify-between text-ink-ghost text-xs">
              <button className="flex items-center gap-1.5 hover:bg-cream/40 p-2 rounded transition-colors flex-1 justify-center">
                <ThumbsUp size={14} />
                <span>Like</span>
              </button>
              <button className="flex items-center gap-1.5 hover:bg-cream/40 p-2 rounded transition-colors flex-1 justify-center">
                <MessageSquare size={14} />
                <span>Comment</span>
              </button>
              <button className="flex items-center gap-1.5 hover:bg-cream/40 p-2 rounded transition-colors flex-1 justify-center">
                <Repeat size={14} />
                <span>Repost</span>
              </button>
              <button className="flex items-center gap-1.5 hover:bg-cream/40 p-2 rounded transition-colors flex-1 justify-center">
                <Send size={14} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === "twitter" && hasTwitter && (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b-[0.5px] border-sand/20 pb-3">
            <h3 className="text-sm font-sans font-bold text-ink-ghost tracking-wider uppercase flex items-center gap-1.5">
              <Hash size={14} />
              <span>Twitter Thread Mock Preview</span>
            </h3>
          </div>

          <div className="max-w-md mx-auto space-y-0.5 relative pl-4 border-l-[1.5px] border-dashed border-sand/60">
            {pack.twitter_thread_payload?.map((tweet, idx) => (
              <div
                key={idx}
                className="bg-white border-[0.5px] border-sand rounded-lg p-5 relative shadow-sm text-left space-y-3 mb-4 last:mb-0 hover:border-sage-deep/30 transition-colors"
              >
                {/* Thread Connector dot */}
                <div className="absolute left-[-21px] top-7 h-2 w-2 rounded-full bg-sand-deep border border-white" />

                {/* Tweet Header */}
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-[#183A7A] text-white font-serif flex items-center justify-center font-bold text-[11px]">
                    SK
                  </div>
                  <div className="leading-tight">
                    <span className="font-sans font-bold text-xs text-ink hover:underline cursor-pointer block sm:inline">Sarah K.</span>
                    <span className="font-sans text-[11px] text-ink-ghost ml-0 sm:ml-1">@sarahk_io · Tweet {tweet.tweet_number}</span>
                  </div>
                </div>

                {/* Tweet content */}
                <p className="font-sans text-[13px] text-ink leading-relaxed">
                  {tweet.tweet_text}
                </p>

                {/* Tweet controls */}
                <div className="border-t-[0.5px] border-sand/15 pt-2 flex items-center justify-start gap-6 text-ink-ghost text-[10.5px]">
                  <span className="flex items-center gap-1 hover:text-ink cursor-pointer"><MessageSquare size={12} /> 12</span>
                  <span className="flex items-center gap-1 hover:text-ink cursor-pointer"><Repeat size={12} /> 4</span>
                  <span className="flex items-center gap-1 hover:text-ink cursor-pointer"><Heart size={12} /> 84</span>
                  <span className="flex items-center gap-1 hover:text-ink cursor-pointer"><Eye size={12} /> 1.2k</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Indexing Tab */}
      {activeTab === "seo" && hasSeo && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between border-b-[0.5px] border-sand/20 pb-3">
            <h3 className="text-sm font-sans font-bold text-ink-ghost tracking-wider uppercase flex items-center gap-1.5">
              <Globe size={14} />
              <span>SEO Indexing & Metadata dashboard</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Snippet preview (Left 2 cols) */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase block">
                Google Search Snippet Preview
              </label>

              <div className="bg-white border-[0.5px] border-sand p-5 rounded-lg shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#202124]">
                  <div className="h-4.5 w-4.5 rounded-full bg-cream flex items-center justify-center font-bold text-[8px] text-ink-ghost">vb</div>
                  <div className="leading-tight flex flex-col">
                    <span className="text-[10px] text-ink-light">ViralBrain AI</span>
                    <span className="text-[9px] text-ink-ghost leading-none">https://viralbrain.ai/p/{pack.id}</span>
                  </div>
                </div>

                <h4 className="font-sans text-sm md:text-base font-medium text-[#1a0dab] hover:underline cursor-pointer">
                  {pack.topic}
                </h4>

                <p className="font-sans text-xs text-[#4d5156] leading-relaxed">
                  {pack.seo_indexing?.meta_description || pack.seo_metadata}
                </p>
              </div>

              {/* Keywords list */}
              <div className="bg-white border-[0.5px] border-sand p-5 rounded-lg shadow-sm space-y-3">
                <h4 className="text-xs font-sans font-bold text-ink border-b-[0.5px] border-sand/20 pb-2">Primary Target Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {pack.seo_indexing?.primary_keywords.map((kw, idx) => (
                    <Badge key={idx} variant="gray" className="px-2.5 py-1 text-xs">
                      {kw}
                    </Badge>
                  )) || pack.primary_keywords?.map((kw, idx) => (
                    <Badge key={idx} variant="gray" className="px-2.5 py-1 text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Hashtag analytics (Right 1 col) */}
            <div className="md:col-span-1 space-y-4">
              <label className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase block">
                Trending Tags Analytics
              </label>

              <div className="bg-white border-[0.5px] border-sand rounded-lg shadow-sm p-4 overflow-hidden">
                <div className="space-y-4">
                  {pack.seo_indexing?.trending_tags.map((tagObj, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b-[0.5px] border-sand/20 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-mono font-bold text-sage-deep bg-sage px-1.5 py-0.5 rounded-sm">
                          {tagObj.tag}
                        </span>
                        <span className="text-[9px] text-ink-ghost block pt-1">
                          Strategy: {tagObj.strategic_purpose}
                        </span>
                      </div>
                      <Badge variant={tagObj.volume_tier === "High" ? "red" : tagObj.volume_tier === "Medium" ? "amber" : "gray"} className="text-[10px]">
                        {tagObj.volume_tier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail tab */}
      {activeTab === "thumbnail" && pack.thumbnail_brief && (
        <ThumbnailBrief
          brief={pack.thumbnail_brief}
          onChangeOverlay={handleThumbnailOverlayChange}
        />
      )}

      {/* Schedule tab */}
      {activeTab === "schedule" && (
        <div className="bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm text-left">
          <div className="flex items-center justify-between border-b-[0.5px] border-sand/20 pb-3 mb-4">
            <h3 className="text-xs font-sans font-bold text-ink-ghost tracking-wider uppercase flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Posting Schedule Matrix</span>
            </h3>
          </div>

          <div className="overflow-x-auto select-none">
            <table className="w-full text-sm text-ink font-sans">
              <thead>
                <tr className="border-b-[0.5px] border-sand/30 text-ink-ghost text-xs uppercase tracking-wide">
                  <th className="py-3 text-left font-bold">Platform</th>
                  <th className="py-3 text-left font-bold">Recommended Time</th>
                  <th className="py-3 text-left font-bold">Timezone</th>
                  <th className="py-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {pack.platforms.map((platform) => (
                  <tr key={platform} className="border-b-[0.5px] border-sand/20 last:border-b-0 hover:bg-blush/30 transition-colors">
                    <td className="py-4">
                      <Badge variant="platform" platform={platform}>
                        {platform}
                      </Badge>
                    </td>
                    <td className="py-4 font-mono font-medium text-ink-light">
                      {(pack.schedule && pack.schedule[platform]) || "Scheduled Tomorrow"}
                    </td>
                    <td className="py-4 font-mono text-ink-ghost">
                      EST (UTC-5)
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs font-semibold px-3 hover:bg-sage/40 hover:text-sage-deep hover:border-sage-deep"
                        onClick={() => alert(`Successfully queued content for ${platform} publishing!`)}
                      >
                        Queue Post
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPackViewer;

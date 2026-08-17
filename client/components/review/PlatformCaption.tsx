"use client";

import React, { useState } from "react";
import { Plus, X, Calendar, MessageCircle } from "lucide-react";
import { InstagramIcon, YoutubeIcon, TwitterIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { Platform } from "@/lib/types";
import { useContentStore } from "@/lib/contentStore";
import { Button } from "@/components/ui/Button";

interface PlatformCaptionProps {
  packId: string;
  platform: Platform;
  caption: string;
  hashtags: string[];
  scheduleTime: string;
}

export const PlatformCaption: React.FC<PlatformCaptionProps> = ({
  packId,
  platform,
  caption,
  hashtags,
  scheduleTime,
}) => {
  const updateCaption = useContentStore((state) => state.updateCaption);
  const updateHashtags = useContentStore((state) => state.updateHashtags);

  const [localCaption, setLocalCaption] = useState(caption);
  const [newTag, setNewTag] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Platform limits
  const charLimits: Record<Platform, number> = {
    tiktok: 2200,
    instagram: 2200,
    twitter: 280,
    linkedin: 3000,
    youtube: 5000,
  };

  const limit = charLimits[platform] || 2000;

  // Platform icons
  const renderPlatformIcon = () => {
    const size = 18;
    switch (platform) {
      case "tiktok":
        return <MessageCircle className="text-[#0B5A7A]" size={size} />;
      case "instagram":
        return <InstagramIcon className="text-[#7A1840]" size={size} />;
      case "youtube":
        return <YoutubeIcon className="text-[#7A1818]" size={size} />;
      case "twitter":
        return <TwitterIcon className="text-[#183A7A]" size={size} />;
      case "linkedin":
        return <LinkedinIcon className="text-[#1E2A7A]" size={size} />;
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, limit);
    setLocalCaption(val);
    updateCaption(packId, platform, val);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = hashtags.filter((t) => t !== tagToRemove);
    updateHashtags(packId, platform, updated);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tagClean = newTag.trim().toLowerCase().replace(/#/g, "");
    if (tagClean && !hashtags.includes(tagClean)) {
      const updated = [...hashtags, tagClean];
      updateHashtags(packId, platform, updated);
      setNewTag("");
    }
  };

  return (
    <div className="space-y-5 bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm text-left">
      {/* Header platform indicator */}
      <div className="flex items-center justify-between border-b-[0.5px] border-sand/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-sm bg-blush flex items-center justify-center">
            {renderPlatformIcon()}
          </div>
          <span className="text-sm font-sans font-bold text-ink uppercase tracking-wider">
            {platform} adaptation
          </span>
        </div>

        <span className={`text-xs font-mono font-medium ${localCaption.length >= limit - 20 ? "text-error" : "text-ink-ghost"}`}>
          {localCaption.length} / {limit} chars
        </span>
      </div>

      {/* Caption Editor textarea */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase">
          Caption text
        </label>
        <textarea
          value={localCaption}
          onChange={handleCaptionChange}
          className="w-full min-h-[160px] p-4 text-sm text-ink bg-cream/10 border-[0.5px] border-sand/40 rounded-md focus:outline-none focus:ring-1 focus:ring-sage-deep focus:border-sage-deep resize-y font-sans leading-relaxed"
        />
      </div>

      {/* Hashtag organizer */}
      <div className="space-y-2">
        <label className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase block">
          Hashtags
        </label>
        
        {/* Pills wrapper */}
        <div className="flex flex-wrap gap-2 items-center">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-blush px-2.5 py-1 text-xs text-ink-light rounded-sm border-[0.5px] border-sand/30 font-medium"
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-ink-ghost hover:text-error transition-colors p-0.5"
              >
                <X size={10} className="stroke-[3]" />
              </button>
            </span>
          ))}

          {/* Inline tag adder */}
          <form onSubmit={handleAddTag} className="inline-flex items-center">
            <div className="relative flex items-center h-7 border-[0.5px] border-sand/40 rounded-sm overflow-hidden bg-cream/5">
              <span className="text-xs text-ink-ghost pl-2.5">#</span>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="tag"
                className="w-16 h-full text-xs text-ink bg-transparent border-none outline-none px-1 py-0.5"
              />
              <button
                type="submit"
                className="h-full px-2 bg-blush border-l-[0.5px] border-sand/30 text-ink-light hover:text-sage-deep hover:bg-sage/40 transition-all flex items-center justify-center"
              >
                <Plus size={12} className="stroke-[3]" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recommended schedule footer */}
      {scheduleTime && (
        <div className="flex items-center gap-2.5 p-3 rounded-md bg-sage/10 border-[0.5px] border-sage-deep/15">
          <Calendar className="h-4 w-4 text-sage-deep flex-shrink-0" />
          <div className="text-xs">
            <span className="text-ink-light font-sans font-medium mr-1.5">Recommended posting window:</span>
            <span className="font-mono font-bold text-sage-deep bg-white border-[0.5px] border-sage-deep/10 px-1.5 py-0.5 rounded-sm">
              {scheduleTime}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformCaption;

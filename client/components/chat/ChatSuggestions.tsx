"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface ChatSuggestionsProps {
  onSelect: (text: string) => void;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ onSelect }) => {
  const suggestions = [
    { text: "Improve my TikTok hooks", emoji: "💡" },
    { text: "Why did my last pack score only 62?", emoji: "📊" },
    { text: "Rewrite this caption for Instagram", emoji: "✍️" },
    { text: "What's trending in my niche right now?", emoji: "🔥" },
  ];

  return (
    <div className="space-y-3.5 p-4 text-left select-none animate-fade-in">
      <span className="text-[10px] font-sans font-bold text-ink-ghost tracking-wider uppercase flex items-center gap-1">
        <Sparkles size={11} className="text-sage-deep" />
        <span>Suggested Prompts</span>
      </span>
      
      <div className="grid grid-cols-2 gap-3">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(sug.text)}
            className="p-3 text-left bg-parchment hover:bg-blush border-[0.5px] border-sand/40 hover:border-sand rounded-md text-xs font-sans font-medium text-ink transition-all duration-150 flex flex-col justify-between min-h-[72px] active:scale-[0.98]"
          >
            <span className="text-base mb-1.5">{sug.emoji}</span>
            <span className="leading-tight line-clamp-2">{sug.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;

"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessage as MessageType } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import ChatSuggestions from "./ChatSuggestions";

interface ChatMessagesProps {
  messages: MessageType[];
  isStreaming: boolean;
  onSuggestionClick: (text: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isStreaming,
  onSuggestionClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-5 flex flex-col scroll-smooth"
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center">
          {/* Welcome Intro */}
          <div className="text-center p-6 space-y-1.5 select-none mb-4">
            <h4 className="font-serif text-lg font-bold text-ink leading-tight">
              ViralBrain Assistant
            </h4>
            <p className="text-xs text-ink-light leading-relaxed max-w-[280px] mx-auto font-sans">
              I can help optimize hooks, draft caption adaptations, translate voice vectors, or review score diagnostics.
            </p>
          </div>

          {/* Preset options */}
          <ChatSuggestions onSelect={onSuggestionClick} />
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {/* Empty spacer to pad layout */}
          <div className="h-2 flex-shrink-0" />
        </>
      )}
    </div>
  );
};

export default ChatMessages;

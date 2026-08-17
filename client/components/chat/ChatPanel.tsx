"use client";

import React, { useEffect } from "react";
import { X, Minimize2, BrainCircuit } from "lucide-react";
import { useChatStore } from "@/lib/chatStore";
import { useContentStore } from "@/lib/contentStore";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { cn } from "@/lib/utils";

export const ChatPanel: React.FC = () => {
  const { state, messages, isStreaming, context, close, minimize, sendMessage } = useChatStore();
  const { activePack } = useContentStore();

  const isOpen = state === "open";

  // Prevent scroll propagation on body when chat drawer is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSuggestionSelect = (text: string) => {
    sendMessage(text);
  };

  const getContextPillLabel = () => {
    const page = context.current_page;
    const packTopic = activePack?.topic;

    if (page === "review" && packTopic) {
      return `Context: Reviewing "${packTopic.slice(0, 20)}..."`;
    }
    if (page === "generate") {
      return "Context: Running Generation Engine";
    }
    if (page === "analytics") {
      return "Context: Performance Analytics";
    }
    return null;
  };

  const contextLabel = getContextPillLabel();

  return (
    <>
      {/* Backdrop overlay for click-away closure */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-ink/15 backdrop-blur-xs z-40 transition-opacity duration-200"
        />
      )}

      {/* Slide-over panel container */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08)] z-45 flex flex-col justify-between transition-transform duration-300 ease-in-out border-l-[0.5px] border-sand/40",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Panel Header */}
        <div className="p-4 border-b-[0.5px] border-sand flex flex-col space-y-2 flex-shrink-0 select-none bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-sage-deep" />
              <div className="flex flex-col text-left">
                <span className="font-sans font-bold text-sm text-ink leading-tight">
                  ViralBrain AI
                </span>
                <span className="text-[10px] text-ink-ghost font-sans mt-0.5 leading-none">
                  Your content intelligence assistant
                </span>
              </div>
            </div>

            {/* Minimize / Close */}
            <div className="flex items-center gap-1">
              <button
                onClick={minimize}
                className="p-1.5 text-ink-ghost hover:text-ink hover:bg-blush rounded transition-colors"
                title="Minimize drawer"
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={close}
                className="p-1.5 text-ink-ghost hover:text-ink hover:bg-blush rounded transition-colors"
                title="Close assistant"
              >
                <X size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Context pill overlay */}
          {contextLabel && (
            <div className="text-[10.5px] text-sage-deep bg-sage/40 border-[0.5px] border-sage-deep/10 font-sans font-semibold rounded-sm px-2.5 py-1 text-left flex items-center justify-between gap-2.5 max-w-full truncate animate-fade-in select-none">
              <span className="truncate">{contextLabel}</span>
            </div>
          )}
        </div>

        {/* Panel Messages list (Scrollable) */}
        <ChatMessages
          messages={messages}
          isStreaming={isStreaming}
          onSuggestionClick={handleSuggestionSelect}
        />

        {/* Panel Input composer */}
        <ChatInput
          onSend={sendMessage}
          disabled={isStreaming}
          activeTopic={activePack?.topic}
        />
      </div>
    </>
  );
};

export default ChatPanel;

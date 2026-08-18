"use client";

import React, { useEffect } from "react";
import { X, Minimize2, BrainCircuit, Clock } from "lucide-react";
import { useChatStore } from "@/lib/chatStore";
import { useContentStore } from "@/lib/contentStore";
import { useUserStore } from "@/lib/userStore";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatHistorySidebar from "./ChatHistorySidebar";
import { cn } from "@/lib/utils";

export const ChatPanel: React.FC = () => {
  const {
    state,
    messages,
    isStreaming,
    isLoading,
    context,
    threads,
    showHistorySidebar,
    toggleHistorySidebar,
    fetchThreads,
    close,
    minimize,
    sendMessage,
  } = useChatStore();

  const { activePack } = useContentStore();
  const { user } = useUserStore();
  const creatorId = user?.creator_profile_id || user?.id || "creator_demo_id";

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

  // Auto-fetch thread history when drawer opens or creator changes
  useEffect(() => {
    if (isOpen && creatorId) {
      fetchThreads(creatorId);
    }
  }, [isOpen, creatorId, fetchThreads]);

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

      {/* Slide-over panel container (expands smoothly when history sidebar is open) */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08)] z-45 flex transition-all duration-300 ease-in-out border-l-[0.5px] border-sand/40 overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full",
          showHistorySidebar ? "w-full sm:w-[640px]" : "w-full sm:w-[400px]"
        )}
      >
        {/* HISTORY SIDEBAR SECTION */}
        {showHistorySidebar && (
          <div className="w-full sm:w-[240px] h-full flex-shrink-0 border-r-[0.5px] border-sand/40 bg-cream/30 animate-fade-in">
            <ChatHistorySidebar />
          </div>
        )}

        {/* MAIN CHAT CONVERSATION CONTAINER */}
        <div className="flex-1 h-full flex flex-col justify-between overflow-hidden bg-white min-w-0">
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

              {/* Action Buttons: History Toggle, Minimize, Close */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleHistorySidebar}
                  className={cn(
                    "p-1.5 rounded transition-colors relative flex items-center justify-center gap-1 text-xs font-semibold px-2",
                    showHistorySidebar
                      ? "bg-sage/40 text-sage-deep font-bold border border-sage-deep/20"
                      : "text-ink-ghost hover:text-ink hover:bg-blush"
                  )}
                  title="Toggle Chat History Sidebar"
                >
                  <Clock size={15} />
                  <span className="hidden sm:inline text-[11px]">History</span>
                  {threads.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-sage-deep text-white text-[9px] font-mono font-bold flex items-center justify-center">
                      {threads.length}
                    </span>
                  )}
                </button>

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
            isStreaming={isStreaming || isLoading}
            onSuggestionClick={handleSuggestionSelect}
          />

          {/* Panel Input composer */}
          <ChatInput
            onSend={sendMessage}
            disabled={isStreaming || isLoading}
            activeTopic={activePack?.topic}
          />
        </div>
      </div>
    </>
  );
};

export default ChatPanel;

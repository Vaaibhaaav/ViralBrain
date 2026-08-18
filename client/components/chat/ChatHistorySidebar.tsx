"use client";

import React from "react";
import { Plus, MessageSquare, Clock, Sparkles, Ghost, Bot, ChevronRight, Loader2 } from "lucide-react";
import { useChatStore } from "@/lib/chatStore";
import { useUserStore } from "@/lib/userStore";
import { cn } from "@/lib/utils";

export const ChatHistorySidebar: React.FC = () => {
  const threads = useChatStore((state) => state.threads);
  const threadId = useChatStore((state) => state.threadId);
  const isHistoryLoading = useChatStore((state) => state.isHistoryLoading);
  const loadThread = useChatStore((state) => state.loadThread);
  const startNewThread = useChatStore((state) => state.startNewThread);

  const { user } = useUserStore();
  const creatorId = user?.creator_profile_id || user?.id || "creator_demo_id";

  const handleSelectThread = (selectedThreadId: string) => {
    if (selectedThreadId === threadId) return;
    loadThread(selectedThreadId, creatorId);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Recent";
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full h-full flex flex-col bg-cream/40 border-r-[0.5px] border-sand/40 select-none overflow-hidden text-left">
      {/* Header with New Chat Button */}
      <div className="p-3.5 border-b-[0.5px] border-sand/40 flex flex-col space-y-2 bg-white/80 backdrop-blur-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sage-deep">
            <Clock size={15} />
            <span className="font-sans font-bold text-xs uppercase tracking-wider text-ink">
              Chat History
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-ink-ghost bg-sand/30 px-1.5 py-0.5 rounded">
            {threads.length} {threads.length === 1 ? "thread" : "threads"}
          </span>
        </div>

        <button
          onClick={startNewThread}
          className="w-full h-9 bg-sage-deep hover:bg-[#345a3c] text-white font-sans text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>New Chat Session</span>
        </button>
      </div>

      {/* Threads list scroll container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scroll-smooth">
        {isHistoryLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-2 text-ink-ghost">
            <Loader2 className="h-5 w-5 animate-spin text-sage-deep" />
            <span className="text-xs font-sans font-medium">Fetching history...</span>
          </div>
        ) : threads.length === 0 ? (
          /* FUNNY EMPTY HISTORY STATE */
          <div className="flex flex-col items-center justify-center p-4 my-6 text-center space-y-3 bg-white/70 border-[0.5px] border-sand/60 rounded-xl shadow-xs animate-fade-in">
            {/* Funny AI Amnesia Graphic */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sage/40 via-amber-100 to-cream border-[0.5px] border-sage-deep/20 flex items-center justify-center shadow-xs">
                <Bot className="w-7 h-7 text-sage-deep animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 text-base">🍿</span>
            </div>

            <div className="space-y-1">
              <h5 className="font-serif font-bold text-sm text-ink leading-tight">
                Zero Past Memory Detected! 🧠
              </h5>
              <p className="text-[11.5px] text-ink-light font-sans leading-relaxed max-w-[200px] mx-auto">
                Your AI assistant has clean amnesia! No past chat threads found. Start your first session now.
              </p>
            </div>

            <button
              onClick={startNewThread}
              className="px-3 py-1.5 text-xs font-semibold text-sage-deep bg-sage/30 hover:bg-sage/50 border border-sage-deep/20 rounded-md transition-colors flex items-center gap-1"
            >
              <Sparkles size={13} />
              <span>Start First Chat 🚀</span>
            </button>
          </div>
        ) : (
          /* THREAD LIST ITEMS */
          threads.map((thread) => {
            const isActive = thread.thread_id === threadId;
            return (
              <button
                key={thread.thread_id}
                onClick={() => handleSelectThread(thread.thread_id)}
                className={cn(
                  "w-full p-2.5 rounded-lg border text-left transition-all flex flex-col space-y-1 group relative",
                  isActive
                    ? "bg-white border-sage-deep/40 shadow-xs ring-[0.5px] ring-sage-deep/20"
                    : "bg-white/60 hover:bg-white border-sand/30 hover:border-sand"
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <MessageSquare
                      size={13}
                      className={cn(
                        "flex-shrink-0 transition-colors",
                        isActive ? "text-sage-deep" : "text-ink-ghost group-hover:text-ink"
                      )}
                    />
                    <span
                      className={cn(
                        "font-sans text-xs font-semibold truncate leading-snug",
                        isActive ? "text-ink font-bold" : "text-ink-light group-hover:text-ink"
                      )}
                    >
                      {thread.summary}
                    </span>
                  </div>
                  <ChevronRight
                    size={12}
                    className={cn(
                      "flex-shrink-0 transition-transform",
                      isActive ? "text-sage-deep translate-x-0.5" : "text-ink-ghost opacity-0 group-hover:opacity-100"
                    )}
                  />
                </div>

                <div className="flex items-center justify-between text-[9.5px] font-mono text-ink-ghost pt-0.5">
                  <span>{formatDate(thread.updated_at)}</span>
                  <span className="bg-sand/30 px-1 py-0.2 rounded text-[9px]">
                    {thread.total_message_count} {thread.total_message_count === 1 ? "msg" : "msgs"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;

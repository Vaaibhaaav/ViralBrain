"use client";

import React from "react";
import { MessageCircle, X } from "lucide-react";
import { useChatStore } from "@/lib/chatStore";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export const ChatWidget: React.FC = () => {
  const { state, open, close, unreadCount } = useChatStore();

  const isOpen = state === "open";
  const isMinimized = state === "minimized";

  const handleToggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      <Tooltip content={isOpen ? "Close Assistant" : "Ask ViralBrain"}>
        <button
          onClick={handleToggle}
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all duration-200 focus:outline-none relative",
            isOpen ? "bg-ink hover:bg-ink-light" : "bg-sage-deep hover:bg-[#345a3c]"
          )}
        >
          {/* Unread badge notification */}
          {!isOpen && unreadCount > 0 && (
            <>
              {/* Pulsing ring animation */}
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-error border border-white flex items-center justify-center font-mono text-[9px] font-bold text-white z-10 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-error border border-white flex items-center justify-center font-mono text-[9px] font-bold text-white z-10">
                {unreadCount}
              </span>
            </>
          )}

          {isOpen ? (
            <X className="h-5.5 w-5.5 animate-rotate-in" />
          ) : (
            <MessageCircle className="h-5.5 w-5.5" />
          )}
        </button>
      </Tooltip>
    </div>
  );
};

export default ChatWidget;

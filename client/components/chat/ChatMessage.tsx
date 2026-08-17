"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, BrainCircuit, ArrowRight, Star } from "lucide-react";
import { ChatMessage as MessageType } from "@/lib/types";
import ChatAgentBadge from "./ChatAgentBadge";
import { useContentStore } from "@/lib/contentStore";
import { useChatStore } from "@/lib/chatStore";
import { useUserStore } from "@/lib/userStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: MessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, type, action, created_at } = message;
  const isUser = role === "user";
  const { packs, promoteHook, approvePack } = useContentStore();
  const { close } = useChatStore();
  const { user } = useUserStore();

  const timeString = new Date(created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleActionClick = () => {
    if (!action) return;

    if (action.onClick === "regenerate_hook" && packs[0]) {
      const firstPack = packs[0];
      if (firstPack.hooks) {
        promoteHook(firstPack.id, firstPack.hooks[2]?.id || firstPack.hooks[0].id);
      }
      alert("AI Action Executed: Hook variant updated and promoted! ✓");
    } else if (action.onClick === "approve_pack" && packs[0]) {
      approvePack(packs[0].id, packs[0].thread_id || "", packs[0].script_draft || "", user?.id || "");
      alert("AI Action Executed: Pack approved and saved to profile! ✓");
    }
  };

  const renderTypingIndicator = () => (
    <div className="flex items-center space-x-1.5 py-1.5 px-2 select-none">
      <div className="h-2 w-2 rounded-full bg-ink-ghost animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 rounded-full bg-ink-ghost animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 rounded-full bg-ink-ghost animate-bounce" />
    </div>
  );

  return (
    <div
      className={cn("flex flex-col space-y-1 max-w-[85%] select-none text-left", {
        "self-end items-end": isUser,
        "self-start items-start": !isUser,
      })}
    >
      {/* Sender Header Name */}
      {!isUser && (
        <div className="flex items-center gap-2 mb-0.5">
          <ChatAgentBadge />
        </div>
      )}

      {/* Bubble frame */}
      <div
        className={cn("p-3.5 text-[13.5px] font-sans leading-relaxed font-normal shadow-sm", {
          "bg-parchment text-ink border-[0.5px] border-sand/40 rounded-[14px_14px_2px_14px]": isUser,
          "bg-white text-ink border-[0.5px] border-sand rounded-[2px_14px_14px_14px]": !isUser,
        })}
      >
        {/* Render typing state if empty and assistant */}
        {!isUser && !content && type === "text" ? (
          renderTypingIndicator()
        ) : (
          <div className="whitespace-pre-wrap">{content}</div>
        )}

        {/* Dynamic Rich components depending on type */}
        {!isUser && content && (
          <div className="space-y-3 mt-3.5 border-t-[0.5px] border-sand/20 pt-3">
            {/* ACTION CARD */}
            {type === "action_card" && action && (
              <div className="bg-cream/40 border-[0.5px] border-sand/40 p-3 rounded-md space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <span className="text-sage-deep">💡</span>
                  <span>Suggested Action</span>
                </div>
                <p className="text-[11.5px] text-ink-light leading-normal">
                  Perform automatic structural updates using recommended patterns.
                </p>
                <Button
                  onClick={handleActionClick}
                  className="h-8 text-xs font-semibold px-3 bg-sage-deep w-full text-white flex items-center justify-center gap-1"
                >
                  <span>{action.label}</span>
                  <ArrowRight size={12} />
                </Button>
              </div>
            )}

            {/* PACK PREVIEW CARD */}
            {type === "pack_preview" && action && (
              <div className="bg-cream/40 border-[0.5px] border-sand/40 p-3 rounded-md space-y-2 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-sage-deep bg-sage px-1.5 py-0.5 rounded-sm">
                    READY
                  </span>
                  <span className="font-mono text-xs font-bold text-sage-deep">
                    Score: 87
                  </span>
                </div>
                <h5 className="font-serif text-sm font-bold text-ink leading-snug line-clamp-2">
                  Why most creators quit at 10k followers
                </h5>
                <Link
                  href={action.href || "/library"}
                  onClick={() => close()}
                  className="text-xs font-semibold text-sage-deep hover:underline flex items-center gap-0.5 mt-2 justify-end"
                >
                  <span>{action.label}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}

            {/* SCORE COMPARISON */}
            {type === "score_comparison" && (
              <div className="space-y-2 text-left">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-error/5 border-[0.5px] border-error/10 p-2.5 rounded-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-error">Before</span>
                      <span className="font-mono font-bold text-error">54%</span>
                    </div>
                    <p className="text-[10.5px] leading-tight text-ink-light font-sans line-clamp-3">
                      &ldquo;I want to tell you why creators fail.&rdquo;
                    </p>
                  </div>
                  <div className="bg-sage/10 border-[0.5px] border-sage-deep/15 p-2.5 rounded-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sage-deep">After</span>
                      <span className="font-mono font-bold text-sage-deep">87%</span>
                    </div>
                    <p className="text-[10.5px] leading-tight text-ink-light font-sans line-clamp-3">
                      &ldquo;Why 92% of creators quit exactly at 10,000 followers.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timestamp footer label */}
      <span className="text-[9px] font-sans font-bold text-ink-ghost uppercase tracking-wider mt-0.5 px-1.5">
        {isUser ? "You" : "ViralBrain"} · {timeString}
      </span>
    </div>
  );
};

export default ChatMessage;

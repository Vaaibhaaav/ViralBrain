"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  activeTopic?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled,
  activeTopic,
}) => {
  const [text, setText] = useState("");
  const [attachContext, setAttachContext] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = text.trim();
    if (cleanText && !disabled) {
      let finalMessage = cleanText;
      if (attachContext && activeTopic) {
        // Appends context reference note for cleaner logic
        finalMessage = `[Context: ${activeTopic}] ${cleanText}`;
      }
      onSend(finalMessage);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t-[0.5px] border-sand bg-white p-4 space-y-2 flex-shrink-0 select-none">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-cream/10 border-[0.5px] border-sand/40 rounded-md p-1.5 focus-within:border-sage-deep focus-within:ring-[0.5px] focus-within:ring-sage-deep transition-all">
        {/* Paperclip attach context */}
        {activeTopic && (
          <button
            type="button"
            onClick={() => setAttachContext(!attachContext)}
            className={cn(
              "p-2 rounded-sm transition-colors flex items-center justify-center flex-shrink-0",
              attachContext 
                ? "bg-sage text-sage-deep" 
                : "text-ink-ghost hover:text-ink hover:bg-blush"
            )}
            title={attachContext ? "Context attached" : "Attach active pack context"}
          >
            {attachContext ? <Check size={16} className="stroke-[3]" /> : <Paperclip size={16} />}
          </button>
        )}

        {/* Text Area input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your content..."
          disabled={disabled}
          className="flex-1 max-h-[120px] min-h-[36px] bg-transparent border-none outline-none resize-none text-[13.5px] text-ink placeholder:text-ink-ghost px-2 py-1.5 font-sans leading-relaxed align-bottom"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className={cn(
            "h-8 w-8 rounded-sm flex items-center justify-center text-white transition-all flex-shrink-0",
            text.trim() && !disabled 
              ? "bg-sage-deep hover:bg-[#345a3c] active:scale-95" 
              : "bg-parchment text-ink-ghost cursor-not-allowed"
          )}
        >
          <ArrowUp size={16} className="stroke-[2.5]" />
        </button>
      </form>

      {/* Footer warning label */}
      <span className="text-[9.5px] font-sans font-bold text-ink-ghost tracking-wider uppercase text-center block leading-none">
        ViralBrain AI can make mistakes. Always review before publishing.
      </span>
    </div>
  );
};

export default ChatInput;

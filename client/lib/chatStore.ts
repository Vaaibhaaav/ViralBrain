import { create } from "zustand";
import { ChatMessage, ChatContext } from "./types";

type ChatState = 'closed' | 'open' | 'minimized';

interface ChatStore {
  state: ChatState;
  messages: ChatMessage[];
  isStreaming: boolean;
  unreadCount: number;
  context: ChatContext;
  
  open: () => void;
  close: () => void;
  minimize: () => void;
  setContext: (ctx: ChatContext) => void;
  sendMessage: (text: string) => Promise<void>;
  triggerProactiveMessage: (text: string, type?: ChatMessage['type'], action?: ChatMessage['action']) => void;
  clearUnread: () => void;
  clearChat: () => void;
}

const INITIAL_CONTEXT: ChatContext = {
  current_page: "dashboard",
};

export const useChatStore = create<ChatStore>((set, get) => ({
  state: "closed",
  messages: [],
  isStreaming: false,
  unreadCount: 0,
  context: INITIAL_CONTEXT,

  open: () => set({ state: "open", unreadCount: 0 }),
  close: () => set({ state: "closed" }),
  minimize: () => set({ state: "minimized" }),
  
  setContext: (ctx) => set((state) => ({ 
    context: { ...state.context, ...ctx } 
  })),

  clearUnread: () => set({ unreadCount: 0 }),
  clearChat: () => set({ messages: [] }),

  triggerProactiveMessage: (text, type = "text", action) => {
    const isPanelOpen = get().state === "open";
    const newMessage: ChatMessage = {
      id: `msg_proactive_${Date.now()}`,
      role: "assistant",
      content: text,
      created_at: new Date().toISOString(),
      type,
      action,
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
      unreadCount: isPanelOpen ? 0 : state.unreadCount + 1,
      // If closed, we might minimize or keep closed but show unread badge
      state: isPanelOpen ? "open" : state.state === "closed" ? "minimized" : state.state
    }));
  },

  sendMessage: async (text) => {
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
      type: "text",
    };

    const assistantMsgId = `msg_assistant_${Date.now()}`;
    const assistantMsgPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      type: "text",
    };

    set((state) => ({
      messages: [...state.messages, userMsg, assistantMsgPlaceholder],
      isStreaming: true,
      unreadCount: 0,
    }));

    try {
      const messagesHistory = [...get().messages.slice(0, -1), userMsg];
      const context = get().context;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesHistory,
          context,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to chat stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          
          // Parse Server-Sent Events format "data: <content>"
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }
              try {
                // If it's pure JSON string or simple text, parse it
                const parsed = JSON.parse(dataStr);
                if (typeof parsed === "string") {
                  accumulatedText += parsed;
                } else if (parsed.content) {
                  accumulatedText += parsed.content;
                }
              } catch {
                accumulatedText += dataStr;
              }

              // Update the message content in real time
              set((state) => {
                const updated = state.messages.map((m) => {
                  if (m.id === assistantMsgId) {
                    return {
                      ...m,
                      content: accumulatedText,
                    };
                  }
                  return m;
                });
                return { messages: updated };
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat Stream Error:", error);
      set((state) => {
        const updated = state.messages.map((m) => {
          if (m.id === assistantMsgId) {
            return {
              ...m,
              content: "I'm having trouble connecting right now. Please try again in a moment.",
            };
          }
          return m;
        });
        return { messages: updated };
      });
    } finally {
      set({ isStreaming: false });
    }
  },
}));

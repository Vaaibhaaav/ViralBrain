import React from "react";
import { BrainCircuit } from "lucide-react";

export const ChatAgentBadge: React.FC = () => {
  return (
    <span className="inline-flex items-center gap-1.5 bg-sage/50 text-sage-deep px-2 py-0.5 rounded-sm text-[10px] font-sans font-bold tracking-wide uppercase border-[0.5px] border-sage-deep/10 select-none">
      <BrainCircuit size={10} className="text-sage-deep" />
      <span>ViralBrain AI</span>
    </span>
  );
};

export default ChatAgentBadge;

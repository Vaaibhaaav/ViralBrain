import React from "react";
import { SignUp } from "@clerk/nextjs";
import { BrainCircuit } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream font-sans">
      {/* Left panel (55%) - Editorial Panel */}
      <div className="w-full md:w-[55%] bg-parchment border-r-[0.5px] border-sand p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Top brand label */}
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-sage-deep" />
          <span className="font-serif text-2xl font-bold tracking-tight text-ink">
            ViralBrain
          </span>
        </div>

        {/* Hero title info */}
        <div className="max-w-[480px] my-auto py-12">
          <h1 className="font-serif text-[42px] md:text-[52px] font-bold text-ink leading-[1.1] tracking-tight mb-8">
            One idea.<br />
            A content pack for the<br />
            whole internet.
          </h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white/70 border-[0.5px] border-sand/40 text-xs font-medium text-ink-light shadow-sm">
              <span>⚡</span> 8 AI Agents
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white/70 border-[0.5px] border-sand/40 text-xs font-medium text-ink-light shadow-sm">
              <span>🧠</span> Learns your voice
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white/70 border-[0.5px] border-sand/40 text-xs font-medium text-ink-light shadow-sm">
              <span>⏱️</span> &lt; 4 min per pack
            </span>
          </div>
        </div>

        {/* Bottom review testimonial */}
        <div className="max-w-[420px]">
          <p className="font-serif italic text-base text-ink-light">
            &ldquo;ViralBrain cut my content workflow down from a chaotic day of editing to minutes. The draft is so close to my voice it feels like magic.&rdquo;
          </p>
          <span className="block text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase mt-2">
            — Marcus T., Tech Creator
          </span>
        </div>
      </div>

      {/* Right panel (45%) - Action Panel */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-6 md:p-12 bg-cream">
        <SignUp 
        signInFallbackRedirectUrl={"/sign-in"}
        forceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || "/"}
        />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import IdeaInput from "@/components/generate/IdeaInput";
import ContentPackCard from "@/components/library/ContentPackCard";
import ContentPackSkeleton from "@/components/library/ContentPackSkeleton";
import { useContentStore } from "@/lib/contentStore";
import { useUserStore } from "@/lib/userStore";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  const { packs, isLoading } = useContentStore();
  const { user } = useUserStore();

  const pendingReviewCount = packs.filter((p) => p.status === "review").length;
  
  // Get recent 3 packs
  const recentPacks = packs.slice(0, 3);

  // Compute stats dynamically from the actual fetched packs
  const packsCount = packs.length;
  const totalScore = packs.reduce((acc, p) => acc + (p.virality_score || 0), 0);
  const avgScore = packsCount > 0 ? (totalScore / packsCount).toFixed(1) : "0.0";
  const approvedCount = packs.filter((p) => p.status === "approved" || p.status === "published").length;
  const approvalRate = packsCount > 0 ? Math.round((approvedCount / packsCount) * 100) : 100;
  const publishedCount = packs.filter((p) => p.status === "published").length;

  const stats = [
    { value: `${packsCount}`, label: "Packs created" },
    { value: `${avgScore}`, label: "Avg score" },
    { value: `${approvalRate}%`, label: "Approval rate" },
    { value: `${publishedCount}`, label: "Posts published" },
  ];

  const greetingName = user?.fullName
    ? user.fullName.split(" ")[0]
    : user?.email
    ? user.email.split("@")[0]
    : "Creator";

  return (
    <div className="space-y-10">
      {/* Hero Greeting Section */}
      <div className="flex flex-col text-left">
        <h1 className="font-serif text-3xl md:text-[36px] font-bold text-ink leading-tight">
          Good morning, {greetingName}.
        </h1>
        <p className="text-[13px] sm:text-sm text-ink-light font-sans mt-1">
          {pendingReviewCount > 0 
            ? `You have ${pendingReviewCount} content pack${pendingReviewCount > 1 ? "s" : ""} pending review.` 
            : "All your content packs are reviewed and scheduled."}
        </p>
      </div>

      {/* Idea Composer */}
      <IdeaInput />

      {/* Stats row widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-white p-4 text-left border-[0.5px] border-sand/60 rounded-md">
            <span className="font-mono text-2xl font-bold text-sage-deep block">
              {stat.value}
            </span>
            <span className="text-[11px] font-sans font-medium text-ink-ghost uppercase tracking-wider block mt-1">
              {stat.label}
            </span>
          </Card>
        ))}
      </div>

      {/* Recent packs list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-[0.5px] border-sand/40 pb-2">
          <h3 className="text-[11px] font-sans font-bold text-ink-ghost tracking-wider uppercase">
            Recent Packs
          </h3>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ContentPackSkeleton />
            <ContentPackSkeleton />
            <ContentPackSkeleton />
          </div>
        ) : recentPacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPacks.map((pack) => (
              <ContentPackCard key={pack.id} pack={pack} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-lg border-[0.5px] border-dashed border-sand/65 animate-fade-in">
            <p className="text-sm text-ink-light">No content packs created yet. Type an idea above to generate your first pack!</p>
          </div>
        )}
      </div>
    </div>
  );
}


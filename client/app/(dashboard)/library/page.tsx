"use client";

import React, { useState } from "react";
import { Plus, HelpCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useContentStore } from "@/lib/contentStore";
import FilterBar from "@/components/library/FilterBar";
import ContentPackCard from "@/components/library/ContentPackCard";
import ContentPackSkeleton from "@/components/library/ContentPackSkeleton";
import { Button } from "@/components/ui/Button";

export default function LibraryPage() {
  const { packs, isLoading } = useContentStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredPacks = packs
    .filter((pack) => {
      const matchesSearch =
        pack.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pack.script_draft || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || pack.status === statusFilter;
      const matchesPlatform =
        platformFilter === "all" || pack.platforms.includes(platformFilter as any);

      return matchesSearch && matchesStatus && matchesPlatform;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "score-desc") {
        return b.virality_score - a.virality_score;
      }
      if (sortBy === "score-asc") {
        return a.virality_score - b.virality_score;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left border-b-[0.5px] border-sand/40 pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink leading-tight">
            Library
          </h1>
          <p className="text-[13px] text-ink-light font-sans mt-0.5">
            Manage your generated drafts, scheduled packs, and voice memory assets.
          </p>
        </div>

        <Link href="/dashboard">
          <Button className="text-xs h-9 px-4 font-semibold flex items-center gap-1.5 bg-sage-deep">
            <Plus size={14} className="stroke-[3]" />
            <span>Generate Pack</span>
          </Button>
        </Link>
      </div>

      {/* Filter and search controllers */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        platformFilter={platformFilter}
        setPlatformFilter={setPlatformFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContentPackSkeleton />
          <ContentPackSkeleton />
          <ContentPackSkeleton />
        </div>
      ) : filteredPacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPacks.map((pack) => (
            <ContentPackCard key={pack.id} pack={pack} />
          ))}
        </div>
      ) : (
        <div className="text-center p-16 bg-white rounded-lg border-[0.5px] border-dashed border-sand flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-10 w-10 text-ink-ghost stroke-[1.5]" />
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-bold text-ink">No drafts found</h4>
            <p className="text-xs text-ink-light max-w-sm mx-auto leading-relaxed">
              No content packs match your search parameters. Try adjusting your platform toggles, search keywords, or create a new pack.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setPlatformFilter("all");
              setSortBy("newest");
            }}
            className="text-xs h-8 font-semibold px-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

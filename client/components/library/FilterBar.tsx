"use client";

import React from "react";
import { Search } from "lucide-react";
import { Platform } from "@/lib/types";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  platformFilter: string;
  setPlatformFilter: (p: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  platformFilter,
  setPlatformFilter,
  sortBy,
  setSortBy,
}) => {
  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "review", label: "Needs Review" },
    { value: "approved", label: "Approved" },
    { value: "published", label: "Published" },
    { value: "generating", label: "Generating" },
  ];

  const platforms: { value: string; label: string }[] = [
    { value: "all", label: "All Platforms" },
    { value: "tiktok", label: "TikTok" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "score-desc", label: "Highest Score" },
    { value: "score-asc", label: "Lowest Score" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border-[0.5px] border-sand/40 p-4 rounded-lg shadow-sm w-full select-none text-left">
      {/* Dropdown filters */}
      <div className="flex flex-wrap gap-2.5">
        {/* Status Dropdown */}
        <div className="flex flex-col">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 h-9 bg-cream border-[0.5px] border-sand/40 rounded-sm text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep hover:bg-blush transition-colors"
          >
            {statuses.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Dropdown */}
        <div className="flex flex-col">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 h-9 bg-cream border-[0.5px] border-sand/40 rounded-sm text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep hover:bg-blush transition-colors"
          >
            {platforms.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex flex-col">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 h-9 bg-cream border-[0.5px] border-sand/40 rounded-sm text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep hover:bg-blush transition-colors"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative flex-1 max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-ghost">
          <Search size={14} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search packs..."
          className="w-full pl-9 pr-4 h-9 bg-cream border-[0.5px] border-sand/40 rounded-sm text-xs font-medium text-ink placeholder:text-ink-ghost focus:outline-none focus:ring-1 focus:ring-sage-deep transition-all"
        />
      </div>
    </div>
  );
};

export default FilterBar;

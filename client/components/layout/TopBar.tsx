"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, MessageSquare, Menu } from "lucide-react";
import { useChatStore } from "@/lib/chatStore";
import { useContentStore } from "@/lib/contentStore";
import { Button } from "@/components/ui/Button";

interface TopBarProps {
  onToggleMobileSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileSidebar }) => {
  const pathname = usePathname();
  const { open: openChat, unreadCount } = useChatStore();
  const { activePack, userProfile } = useContentStore();

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "ViralBrain";

    const firstSegment = segments[0];
    
    if (firstSegment === "dashboard") {
      return "Dashboard / Overview";
    } else if (firstSegment === "generate") {
      return "Generate / Live Progress";
    } else if (firstSegment === "library") {
      return "Library / Content Packs";
    } else if (firstSegment === "review") {
      const topicTitle = activePack?.topic
        ? activePack.topic.length > 25
          ? `${activePack.topic.slice(0, 25)}...`
          : activePack.topic
        : "Details";
      return `Review / ${topicTitle}`;
    } else if (firstSegment === "analytics") {
      return "Analytics / Performance";
    } else if (firstSegment === "settings") {
      return "Account / Settings";
    } else if (firstSegment === "profile") {
      return "Account / Profile";
    }

    return segments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ");
  };

  return (
    <header className="h-[52px] bg-white border-b-[0.5px] border-sand flex items-center justify-between px-4 sm:px-6 w-full sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 hover:bg-blush rounded-md text-ink-light hover:text-ink transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <span className="text-[13px] font-sans font-medium text-ink-light tracking-wide truncate">
          {getBreadcrumbs()}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ask AI ghost button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={openChat}
          className="relative text-xs font-semibold h-8 text-sage-deep px-3 hover:bg-sage/40 flex items-center gap-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Ask AI</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-error text-white font-mono text-[9px] flex items-center justify-center border-[1.5px] border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Notifications */}
        <button className="p-1.5 text-ink-light hover:text-ink hover:bg-blush rounded-md transition-colors relative">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-amber rounded-full" />
        </button>

        {/* Vertical divider */}
        <div className="h-4 w-[0.5px] bg-sand/60" />

        {/* User initials bubble menu */}
        <div className="h-7 w-7 rounded-full bg-parchment border-[0.5px] border-sand/60 font-serif flex items-center justify-center text-xs font-bold text-ink shadow-sm select-none cursor-pointer hover:bg-blush transition-colors">
          {userProfile.name.split(" ").map(n => n[0]).join("")}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

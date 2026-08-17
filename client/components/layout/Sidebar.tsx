"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Library,
  FileCheck,
  BarChart3,
  MessageSquareCode,
  User,
  Settings,
  HelpCircle,
  LogOut,
  BrainCircuit,
  Menu
} from "lucide-react";
import { useContentStore } from "@/lib/contentStore";
import { useChatStore } from "@/lib/chatStore";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/userStore";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { userProfile, packs } = useContentStore();
  const { open: openChat } = useChatStore();
  const { user } = useUserStore();
  console.log("LAVDYAM NA BHOJYAM" , user)
  const pendingReviewCount = packs.filter((p) => p.status === "review").length;

  const mainNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Generate", href: "/generate", icon: Sparkles },
    { name: "Library", href: "/library", icon: Library },
    {
      name: "Review",
      href: packs.find(p => p.status === "review") ? `/review/${packs.find(p => p.status === "review")?.id}` : "/library",
      icon: FileCheck,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined
    },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const accountNav = [
    { name: "Profile", href: user?.creator_profile_id ? `/profile/${user.creator_profile_id}` : "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const renderNavItem = (item: typeof mainNav[0] | typeof accountNav[0]) => {
    // Check active path. If exact match or nested (e.g. /review/pack_1 matches /review)
    const isActive = item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href.split("/")[1] ? `/${item.href.split("/")[1]}` : item.href);

    const handleClick = () => {
      if (onCloseMobile) onCloseMobile();
    };

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={handleClick}
        className={cn(
          "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all duration-150 group",
          isActive
            ? "bg-sage text-sage-deep font-medium"
            : "text-ink-light hover:bg-blush hover:text-ink"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-sage-deep" : "text-ink-light group-hover:text-ink")} />
          <span>{item.name}</span>
        </div>
        {"badge" in item && item.badge ? (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-pill font-mono font-medium",
            isActive ? "bg-sage-deep text-white" : "bg-sage text-sage-deep"
          )}>
            {item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <aside className="w-[240px] h-full flex flex-col bg-parchment border-r-[0.5px] border-sand">
      {/* Brand logo header */}
      <div className="h-14 border-b-[0.5px] border-sand px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-sage-deep" />
          <span className="font-serif text-lg font-bold tracking-tight text-ink">
            ViralBrain
          </span>
        </div>
      </div>

      {/* User profile capsule */}
      <div className="p-4 border-b-[0.5px] border-sand flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-sage-deep text-white font-serif flex items-center justify-center text-sm font-semibold shadow-inner">
          {user?.fullName?.split(" ").map(n=>n[0]).join("")}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-ink truncate leading-tight">
            {user?.fullName}
          </span>
          <span className="text-[10px] text-ink-ghost uppercase tracking-wider font-medium mt-0.5">
            {user?.tier?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-sans font-bold text-ink-ghost tracking-wider block uppercase px-3 mb-1">
            Main
          </span>
          {mainNav.map(renderNavItem)}

          {/* Ask AI button link */}
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              openChat();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ink-light hover:bg-blush hover:text-ink rounded-md transition-all duration-150 text-left group"
          >
            <MessageSquareCode className="h-[18px] w-[18px] text-ink-light group-hover:text-ink" />
            <span>Ask ViralBrain 💬</span>
          </button>
        </div>

        {/* Account section */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-sans font-bold text-ink-ghost tracking-wider block uppercase px-3 mb-1">
            Account
          </span>
          {accountNav.map(renderNavItem)}
        </div>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t-[0.5px] border-sand bg-parchment/60 space-y-1.5">
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2 text-xs text-ink-light hover:text-ink rounded-md transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help & docs</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 text-xs text-error hover:bg-error/5 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4 text-error" />
          <span>Sign out</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;

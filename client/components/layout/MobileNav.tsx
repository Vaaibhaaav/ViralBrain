"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  Library, 
  FileCheck,
  MessageSquare
} from "lucide-react";
import { useContentStore } from "@/lib/contentStore";
import { useChatStore } from "@/lib/chatStore";
import { cn } from "@/lib/utils";

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { packs } = useContentStore();
  const { open: openChat, unreadCount } = useChatStore();

  const pendingReviewCount = packs.filter((p) => p.status === "review").length;

  const items = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create", href: "/generate", icon: Sparkles },
    { name: "Library", href: "/library", icon: Library },
    { 
      name: "Review", 
      href: packs.find(p => p.status === "review") ? `/review/${packs.find(p => p.status === "review")?.id}` : "/library", 
      icon: FileCheck,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-parchment border-t-[0.5px] border-sand flex items-center justify-around px-2 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] pb-safe">
      {items.map((item) => {
        const isActive = item.href === "/" 
          ? pathname === "/" 
          : pathname.startsWith(item.href.split("/")[1] ? `/${item.href.split("/")[1]}` : item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-ink-light transition-colors relative",
              isActive ? "text-sage-deep font-semibold" : "hover:text-ink"
            )}
          >
            <item.icon className={cn("h-5 w-5 mb-0.5", isActive ? "text-sage-deep" : "text-ink-light")} />
            <span className="text-[10px] tracking-wide font-sans">{item.name}</span>
            {item.badge ? (
              <span className="absolute top-2 right-1/4 h-4 min-w-4 px-1 rounded-full bg-error text-white font-mono text-[9px] flex items-center justify-center border border-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}

      {/* Dynamic Chat option */}
      <button
        onClick={openChat}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-ink-light hover:text-ink relative"
      >
        <MessageSquare className="h-5 w-5 mb-0.5" />
        <span className="text-[10px] tracking-wide font-sans">Ask AI</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-1/4 h-4 min-w-4 px-1 rounded-full bg-error text-white font-mono text-[9px] flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
      </button>
    </nav>
  );
};

export default MobileNav;

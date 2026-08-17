"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import ChatWidget from "@/components/chat/ChatWidget";
import ChatPanel from "@/components/chat/ChatPanel";
import { useChatStore } from "@/lib/chatStore";
import { fetchUserProfile } from "@/database/actions/user";
import { useUserStore } from "@/lib/userStore";
import { useContentStore } from "@/lib/contentStore";
import { useUser } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const setContext = useChatStore((state) => state.setContext);

  console.log("ALL ENV KEYS:", Object.keys(process.env).filter(k => k.includes("DATABASE_URL")));
  console.log(useUserStore().user)
  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const { user: clerkUser, isLoaded } = useUser();
  const { user: storeUser, setUser } = useUserStore();
  const { fetchPacks, setUserProfile } = useContentStore();

  useEffect(() => {
    async function syncStore() {
      if (isLoaded && clerkUser?.id) {
        try {
          const userProfile = await fetchUserProfile(clerkUser.id);
          console.log("[USER PROFILE FETCHED SUCCESSFULLY]", userProfile);
          if (userProfile) {
            setUser(userProfile as any);
            setUserProfile({
              id: userProfile.id,
              name: userProfile.fullName || userProfile.email?.split("@")[0] || "Creator",
              email: userProfile.email || "",
              plan: userProfile.tier === "premium" || userProfile.tier === "enterprise" ? "pro" : "free",
              packs_created: 0,
              voice_vectors: 3840,
              approval_rate: 100,
              connected_platforms: ["youtube", "tiktok", "instagram", "twitter", "linkedin"],
              default_settings: {
                topic_details: "",
                niche: userProfile.niche || "",
                preferred_language: userProfile.preferredLanguage || "English",
                target_audience: userProfile.targetAudience || "",
                primary_platform: (userProfile.primaryPlatform?.toLowerCase() || "youtube") as any,
                preferred_personalized_output: true,
              }
            });
            await fetchPacks(clerkUser.id);
          }
        } catch (error) {
          console.error("Failed to hydrate user profile store:", error);
        }
      }
    }

    syncStore();
  }, [clerkUser, isLoaded, setUser, setUserProfile, fetchPacks]);

  useEffect(() => {
    const pageKey = pathname.split("/").filter(Boolean)[0] || "dashboard";

    const isReview = pathname.startsWith("/review/");
    const activePackId = isReview ? pathname.split("/")[2] : undefined;

    setContext({
      current_page: pageKey,
      active_pack_id: activePackId,
    });
  }, [pathname, setContext]);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink select-none relative overflow-x-hidden">
      <div className="flex flex-1 h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar />
        </div>

        {/* Slide-over sidebar for mobile devices */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-45 flex">
            {/* Backdrop filter */}
            <div
              className="fixed inset-0 bg-ink/30 backdrop-blur-xs transition-opacity duration-200"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Slide drawer container */}
            <div className="relative flex flex-col w-[240px] max-w-xs bg-parchment h-full shadow-lg z-50 animate-slide-in-left">
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace section */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <TopBar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 pb-24 md:pb-8 bg-cream">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom tab dock nav */}
      <MobileNav />

      {/* Global AI Chat integrations (renders overlays persisting navigation clicks) */}
      <ChatWidget />
      <ChatPanel />
    </div>
  );
}

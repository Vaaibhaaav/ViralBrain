"use client";

import React, { useState, useEffect } from "react";
import AvatarUpload from "@/components/profile/AvatarUpload";
import VoiceProfileStats from "@/components/profile/VoiceProfileStats";
import IntegrationCard from "@/components/profile/IntegrationCard";
import { useContentStore } from "@/lib/contentStore";
import { useUserStore } from "@/lib/userStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, updateCreatorProfile } = useUserStore();
  const { clearVoiceProfile } = useContentStore();
  
  const [userName, setUserName] = useState(user?.fullName || user?.email?.split("@")[0] || "Creator");
  const [niche, setNiche] = useState(user?.niche || "");
  const [targetAudience, setTargetAudience] = useState(user?.targetAudience || "");
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || "English");
  const [primaryPlatform, setPrimaryPlatform] = useState(user?.primaryPlatform || "youtube");

  // Sync state if store updates (e.g. on hydration or save)
  useEffect(() => {
    if (user) {
      setNiche(user.niche || "");
      setTargetAudience(user.targetAudience || "");
      setPreferredLanguage(user.preferredLanguage || "English");
      setPrimaryPlatform(user.primaryPlatform || "youtube");
      setUserName(user.fullName || user.email?.split("@")[0] || "Creator");
    }
  }, [user]);
  
  // Custom Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Clear confirmation modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleNameChange = (newName: string) => {
    setUserName(newName);
    // Trigger update in database user profile using save name logic
    if (user) {
      useUserStore.getState().setUser({
        ...user,
        fullName: newName
      });
    }
    setToastMessage("Profile username updated successfully ✓");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCreatorProfile({
        niche,
        targetAudience,
        preferredLanguage,
        primaryPlatform,
      });

      // Also update compatibility default settings in contentStore to keep it synced
      useContentStore.getState().updateDefaultSettings({
        topic_details: "",
        niche,
        preferred_language: preferredLanguage,
        target_audience: targetAudience,
        primary_platform: primaryPlatform as any,
        preferred_personalized_output: true
      });

      setToastMessage("Creator preferences updated successfully ✓");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to update preferences ✗");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleClearProfile = () => {
    setShowClearConfirm(true);
  };

  const confirmClearProfile = () => {
    clearVoiceProfile();
    setShowClearConfirm(false);
    setToastMessage("Voice Profile style vectors cleared successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-8 select-none relative">
      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-sage text-sage-deep px-4 py-3 rounded-lg border-[0.5px] border-sage-deep/20 shadow-lg animate-slide-in-right">
          <CheckCircle className="h-4.5 w-4.5 text-sage-deep" />
          <span className="text-xs font-sans font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/35 backdrop-blur-xs" onClick={() => setShowClearConfirm(false)} />
          <Card className="bg-white border-[0.5px] border-sand p-6 rounded-lg max-w-sm w-full relative z-10 shadow-lg text-left space-y-4">
            <div className="flex items-center gap-2.5 text-error">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-serif text-lg font-bold text-ink">Clear Voice Profile?</h3>
            </div>
            <p className="text-xs text-ink-light leading-relaxed">
              Are you sure you want to clear your creator voice profile? Resetting wipe out your voice vectors and reset your personalized writing assistant models. You cannot undo this.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowClearConfirm(false)} className="h-9 text-xs">
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={confirmClearProfile} className="h-9 text-xs bg-error hover:bg-error/90 text-white">
                Wipe Profile
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Header section */}
      <div className="text-left border-b-[0.5px] border-sand/40 pb-4">
        <h1 className="font-serif text-3xl font-bold text-ink leading-tight">
          Creator Profile
        </h1>
        <p className="text-[13px] text-ink-light font-sans mt-0.5">
          Customize your user preferences, monitor creator preferences, and connect platforms.
        </p>
      </div>

      {/* Content wrapper */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Avatar Upload */}
        <AvatarUpload initialName={userName} onNameChange={handleNameChange} />

        {/* Creator Preferences Form */}
        <Card className="bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm space-y-6 text-left">
          <div className="border-b-[0.5px] border-sand/20 pb-2 flex justify-between items-center">
            <h3 className="text-xs font-sans font-bold text-ink-ghost tracking-wider uppercase">
              Update Creator Preferences
            </h3>
          </div>

          <form onSubmit={handleSavePreferences} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Niche */}
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-ink">
                Niche / Category
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Solopreneurship"
                className="w-full h-10 rounded border-[0.5px] border-sand/40 bg-white px-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep focus:border-sage-deep font-sans"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-ink">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Mid-tier creators"
                className="w-full h-10 rounded border-[0.5px] border-sand/40 bg-white px-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep focus:border-sage-deep font-sans"
              />
            </div>

            {/* Preferred Language */}
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-ink">
                Preferred Language
              </label>
              <input
                type="text"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                placeholder="English"
                className="w-full h-10 rounded border-[0.5px] border-sand/40 bg-white px-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep focus:border-sage-deep font-sans"
              />
            </div>

            {/* Primary Platform */}
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-ink">
                Primary Platform
              </label>
              <select
                value={primaryPlatform}
                onChange={(e) => setPrimaryPlatform(e.target.value)}
                className="w-full h-10 bg-white border-[0.5px] border-sand/40 rounded text-xs text-ink px-3 focus:outline-none focus:ring-1 focus:ring-sage-deep hover:bg-blush transition-colors font-sans"
              >
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <Button
                type="submit"
                className="text-xs h-9 px-4 font-semibold bg-sage-deep text-white hover:bg-sage-deep/90 rounded font-sans"
              >
                Save Preferences
              </Button>
            </div>
          </form>
        </Card>

        {/* Voice Profile Memory statistics */}
        <VoiceProfileStats />

        {/* Third-party Platform Integrations */}
        <IntegrationCard />

        {/* DANGER ZONE */}
        <div className="space-y-4 pt-4 text-left">
          <div className="border-b-[0.5px] border-error/25 pb-2">
            <h4 className="text-[11px] font-sans font-bold text-error tracking-wider uppercase">
              Danger Zone
            </h4>
          </div>
          
          <Card className="bg-[#FFF8F7] border-[0.5px] border-error/20 p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h5 className="text-xs font-sans font-bold text-ink">
                Reset Voice Memory Profile
              </h5>
              <p className="text-[11px] text-ink-light font-sans">
                Permanently delete all style vectors and semantic memories matching your approved script patterns.
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleClearProfile}
              className="text-xs font-semibold h-[38px] px-4 rounded-md border-error text-error bg-white hover:bg-error hover:text-white transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Trash2 size={13} />
              <span>Clear Voice Profile</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

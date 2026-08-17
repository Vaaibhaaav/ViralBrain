"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Save, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Platform } from "@/lib/types";
import { useContentStore } from "@/lib/contentStore";
import { useUserStore } from "@/lib/userStore";

export default function SettingsPage() {
  const router = useRouter();
  
  // Custom Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Modal confirm delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user, updateCreatorProfile } = useUserStore();

  // States
  const [threshold, setThreshold] = useState(60);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["tiktok", "youtube", "instagram"]);
  const [selectedTone, setSelectedTone] = useState<string>("educational");
  const [notifications, setNotifications] = useState({
    packReady: true,
    scoreWarning: true,
    weeklyInsights: false,
  });

  // Default Generation Settings Form States
  const [topicDetails, setTopicDetails] = useState("");
  const [niche, setNiche] = useState(user?.niche || "");
  const [language, setLanguage] = useState(user?.preferredLanguage || "English");
  const [audience, setAudience] = useState(user?.targetAudience || "");
  const [primaryPlatform, setPrimaryPlatform] = useState<Platform>((user?.primaryPlatform?.toLowerCase() || "youtube") as Platform);
  const [personalized, setPersonalized] = useState(true);

  const platforms: { id: Platform; label: string }[] = [
    { id: "tiktok", label: "TikTok" },
    { id: "instagram", label: "Instagram" },
    { id: "youtube", label: "YouTube" },
    { id: "twitter", label: "Twitter" },
    { id: "linkedin", label: "LinkedIn" },
  ];

  const tones = [
    { id: "casual", label: "Casual", desc: "Friendly, accessible, conversational" },
    { id: "educational", label: "Educational", desc: "Informative, structured, analytical" },
    { id: "controversial", label: "Controversial", desc: "Provocative, debate-driven, bold" },
  ];

  const handleTogglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length === 1) return;
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateCreatorProfile({
        niche,
        targetAudience: audience,
        preferredLanguage: language,
        primaryPlatform,
      });

      // Sync local contentStore compatibility default settings
      useContentStore.getState().updateDefaultSettings({
        topic_details: topicDetails,
        niche,
        preferred_language: language,
        target_audience: audience,
        primary_platform: primaryPlatform,
        preferred_personalized_output: personalized,
      });

      setToastMessage("Settings saved successfully ✓");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setToastMessage("Failed to save settings ✗");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    // Redirect to signup
    router.push("/signup");
  };

  return (
    <div className="space-y-8 select-none relative text-left">
      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-sage text-sage-deep px-4 py-3 rounded-lg border-[0.5px] border-sage-deep/20 shadow-lg animate-slide-in-right">
          <CheckCircle className="h-4.5 w-4.5 text-sage-deep" />
          <span className="text-xs font-sans font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/35 backdrop-blur-xs" onClick={() => setShowDeleteConfirm(false)} />
          <Card className="bg-white border-[0.5px] border-sand p-6 rounded-lg max-w-sm w-full relative z-10 shadow-lg text-left space-y-4">
            <div className="flex items-center gap-2.5 text-error">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-serif text-lg font-bold text-ink">Delete Account?</h3>
            </div>
            <p className="text-xs text-ink-light leading-relaxed">
              Are you sure you want to delete your ViralBrain account? This action is immediate, irreversible, and will delete all your creator content packs, logs, voice settings, and templates.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)} className="h-9 text-xs">
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={confirmDelete} className="h-9 text-xs bg-error hover:bg-error/90 text-white">
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Header section */}
      <div className="text-left border-b-[0.5px] border-sand/40 pb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink leading-tight">
            Settings
          </h1>
          <p className="text-[13px] text-ink-light font-sans mt-0.5">
            Configure default content parameters, score limits, and account preferences.
          </p>
        </div>

        <Button
          onClick={handleSaveSettings}
          className="text-xs h-9 px-4 font-semibold flex items-center gap-1.5 bg-sage-deep"
        >
          <Save size={14} />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Default Generation Profile Settings Card */}
        <Card className="bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm space-y-6">
          <h3 className="text-xs font-sans font-bold text-ink-ghost tracking-wider uppercase border-b-[0.5px] border-sand/20 pb-2">
            Default Generation Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Topic Details input */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-sans font-semibold text-ink">
                Default Topic Details Template (max 150 chars)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topicDetails}
                  onChange={(e) => setTopicDetails(e.target.value.slice(0, 150))}
                  placeholder="e.g. Why manual editing causes burnout."
                  className="w-full h-10 rounded border-[0.5px] border-sand/40 bg-white px-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep focus:border-sage-deep"
                />
                <span className="absolute right-2.5 top-3 text-[9px] font-mono text-ink-ghost">
                  {topicDetails.length} / 150
                </span>
              </div>
            </div>

            {/* Niche */}
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-ink">
                Default Niche / Category
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Solopreneurship"
                className="w-full h-10 rounded border-[0.5px] border-sand/40 bg-white px-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep focus:border-sage-deep"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-ink">
                Default Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Mid-tier creators"
                className="w-full h-10 rounded border-[0.5px] border-sand/40 bg-white px-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep focus:border-sage-deep"
              />
            </div>

            {/* Language */}
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-ink">
                Default Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English"
                className="w-full h-10 rounded border-[0.5px] border-sand/40 bg-white px-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage-deep focus:border-sage-deep"
              />
            </div>

            {/* Primary Platform Select */}
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-ink">
                Default Primary Platform
              </label>
              <select
                value={primaryPlatform}
                onChange={(e) => setPrimaryPlatform(e.target.value as Platform)}
                className="w-full h-10 bg-white border-[0.5px] border-sand/40 rounded text-xs text-ink px-3 focus:outline-none focus:ring-1 focus:ring-sage-deep hover:bg-blush transition-colors"
              >
                {platforms.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Personalized learning active switch */}
            <div className="md:col-span-2 flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="def-personalized"
                checked={personalized}
                onChange={(e) => setPersonalized(e.target.checked)}
                className="h-4.5 w-4.5 accent-sage-deep rounded cursor-pointer"
              />
              <label htmlFor="def-personalized" className="text-xs font-sans font-medium text-ink-light cursor-pointer select-none">
                Enable voice vector learning profile automatically for new packs
              </label>
            </div>
          </div>
        </Card>

        {/* Core parameters Card */}
        <Card className="bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm space-y-6">
          <h3 className="text-xs font-sans font-bold text-ink-ghost tracking-wider uppercase border-b-[0.5px] border-sand/20 pb-2">
            Default Content Preferences
          </h3>

          {/* Slider for score threshold */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans font-semibold text-ink">
                Auto-Regeneration Score Threshold
              </span>
              <span className="font-mono font-bold text-sage-deep bg-sage/30 px-2 py-0.5 rounded-sm">
                {threshold} / 100
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full h-1 bg-parchment rounded-lg appearance-none cursor-pointer accent-sage-deep"
            />
            <span className="text-[10px] text-ink-ghost font-sans italic block">
              Content packs scoring below this index will automatically queue agent revisions.
            </span>
          </div>

          {/* Default platforms checklist */}
          <div className="space-y-2">
            <span className="text-xs font-sans font-semibold text-ink block">
              Default Channels
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {platforms.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleTogglePlatform(p.id)}
                    className={`px-3.5 py-1.5 text-xs rounded-md border-[0.5px] font-medium tracking-wide transition-all ${
                      isSelected
                        ? "bg-sage border-sage-deep text-sage-deep font-semibold"
                        : "bg-white border-sand/40 text-ink-light hover:bg-blush"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone preferred settings (radio chips layout) */}
          <div className="space-y-2">
            <span className="text-xs font-sans font-semibold text-ink block">
              Preferred Writing Tone
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {tones.map((tone) => {
                const isActive = selectedTone === tone.id;
                return (
                  <div
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`p-4 rounded-md border-[0.5px] cursor-pointer transition-all text-left flex flex-col justify-between min-h-[90px] ${
                      isActive
                        ? "border-sage-deep bg-sage/20 ring-[0.5px] ring-sage-deep"
                        : "border-sand/40 bg-cream/10 hover:border-sand hover:bg-blush/25"
                    }`}
                  >
                    <span className="text-xs font-sans font-bold text-ink">
                      {tone.label}
                    </span>
                    <span className="text-[10px] text-ink-light leading-relaxed mt-2.5 font-sans">
                      {tone.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Notifications card */}
        <Card className="bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="text-xs font-sans font-bold text-ink-ghost tracking-wider uppercase border-b-[0.5px] border-sand/20 pb-2">
            Notification Preferences
          </h3>

          <div className="space-y-3.5 pt-1">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col text-left">
                <span className="font-semibold text-ink">Pack Generation Completed</span>
                <span className="text-[10px] text-ink-ghost font-sans mt-0.5">Send a workspace alert when all 8 agents finish.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.packReady}
                onChange={(e) => setNotifications({ ...notifications, packReady: e.target.checked })}
                className="h-4.5 w-4.5 accent-sage-deep cursor-pointer"
              />
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col text-left">
                <span className="font-semibold text-ink">Virality Score Warnings</span>
                <span className="text-[10px] text-ink-ghost font-sans mt-0.5">Notify immediately if scored parameters are below {threshold}.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.scoreWarning}
                onChange={(e) => setNotifications({ ...notifications, scoreWarning: e.target.checked })}
                className="h-4.5 w-4.5 accent-sage-deep cursor-pointer"
              />
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col text-left">
                <span className="font-semibold text-ink">Weekly Analytics Report</span>
                <span className="text-[10px] text-ink-ghost font-sans mt-0.5">Digest score metrics summaries every Monday morning.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyInsights}
                onChange={(e) => setNotifications({ ...notifications, weeklyInsights: e.target.checked })}
                className="h-4.5 w-4.5 accent-sage-deep cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* DANGER ZONE settings */}
        <div className="space-y-4 pt-4 text-left">
          <div className="border-b-[0.5px] border-error/25 pb-2">
            <h4 className="text-[11px] font-sans font-bold text-error tracking-wider uppercase">
              Danger Zone
            </h4>
          </div>

          <Card className="bg-[#FFF8F7] border-[0.5px] border-error/20 p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h5 className="text-xs font-sans font-bold text-ink">
                Delete Account
              </h5>
              <p className="text-[11px] text-ink-light font-sans">
                Permanently purge your dashboard archives, voice style profiles, and api keys database.
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="text-xs font-semibold h-[38px] px-4 rounded-md border-error text-error bg-white hover:bg-error hover:text-white transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Trash2 size={13} />
              <span>Delete Account</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

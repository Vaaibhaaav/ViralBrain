"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Share2, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useContentStore } from "@/lib/contentStore";
import ViralityScoreMeter from "@/components/review/ViralityScoreMeter";
import ReviewActions from "@/components/review/ReviewActions";
import ContentPackViewer from "@/components/review/ContentPackViewer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { useUserStore } from "@/lib/userStore";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const packId = params.id as string;

  const {
    packs,
    isLoading,
    activePack,
    setActivePack,
    updatePackTitle,
    updatePack,
    approvePack,
    discardPack,
    updatePackFeedback,
  } = useContentStore();

  const [isEditingScript, setIsEditingScript] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const { user } = useUserStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const pack = packs.find((p) => p.id === packId);

  useEffect(() => {
    if (pack) {
      setActivePack(pack);
      setTitleInput(pack.topic);
    } else if (!isLoading) {
      router.push("/library");
    }

    return () => {
      const { isGenerating, generatingPackId } = useContentStore.getState();
      if (!isGenerating || generatingPackId !== packId) {
        setActivePack(null);
      }
    };
  }, [packId, pack, isLoading, setActivePack, router]);

  if (!pack || !packId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-sage-deep/20 border-t-sage-deep" />
        <span className="text-xs text-ink-ghost font-sans mt-3">Loading content pack details...</span>
      </div>
    );
  }

  const handleTitleSave = () => {
    if (titleInput.trim()) {
      updatePackTitle(pack.id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleApprove = async () => {
    try {
      await approvePack(pack.id, pack.thread_id as string, pack.script_draft, user?.id as string);
      setToastMessage("Pack approved and saved to Voice Profile ✓");
    } catch (error) {
      console.error("Error approving pack:", error);
      setToastMessage("Something went wrong — please try again");
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleChangeScript = (inputText: string) => {
    updatePackFeedback(activePack?.id as string, activePack?.thread_id as string, inputText as string);
  };

  const handleRegenerate = (inputText: string) => {
    handleChangeScript(inputText);
    router.push("/generate");
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    discardPack(pack.id);
    router.push("/library");
  };

  const getPlatformsListString = () => {
    return pack.platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ");
  };

  return (
    <div className="space-y-6 relative max-w-6xl mx-auto">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-sage text-sage-deep px-4 py-3 rounded-lg border-[0.5px] border-sage-deep/20 shadow-lg animate-slide-in-right">
          <CheckCircle className="h-4.5 w-4.5 text-sage-deep" />
          <span className="text-xs font-sans font-semibold">{toastMessage}</span>
        </div>
      )}

      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/35 backdrop-blur-xs" onClick={() => setShowDiscardConfirm(false)} />

          <Card className="bg-white border-[0.5px] border-sand p-6 rounded-lg max-w-sm w-full relative z-10 shadow-lg text-left space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink">Discard Content Pack?</h3>
            <p className="text-xs text-ink-light leading-relaxed">
              Are you sure you want to discard &ldquo;{pack.topic}&rdquo;? This action will permanently delete
              all scripts, hook variations, and platform captions. It cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowDiscardConfirm(false)} className="h-9 text-xs">
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={confirmDiscard} className="h-9 text-xs">
                Discard
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between border-b-[0.5px] border-sand/40 pb-4">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-light hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Library</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold px-2.5 hover:bg-blush">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border-[0.5px] border-sand p-6 rounded-lg shadow-sm text-left space-y-4">
            <div>
              <span className="text-[10px] font-sans font-bold text-ink-ghost tracking-wider uppercase block mb-1">
                Pack Title
              </span>
              {isEditingTitle ? (
                <div className="flex items-start gap-1.5">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                    className="flex-1 px-2.5 py-1.5 text-base text-ink bg-cream/15 border-[0.5px] border-sand/40 rounded-md focus:outline-none focus:ring-1 focus:ring-sage-deep font-serif font-bold leading-tight"
                    autoFocus
                  />
                </div>
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="font-serif text-xl md:text-[22px] font-bold text-ink leading-snug tracking-tight hover:bg-blush/40 cursor-pointer rounded-sm p-1 -ml-1 transition-all"
                >
                  {pack.topic}
                </h2>
              )}
            </div>

            <div className="flex flex-col space-y-2 border-t-[0.5px] border-sand/20 pt-4">
              <div className="flex items-center gap-2 text-xs text-ink-light font-sans">
                <Clock className="h-3.5 w-3.5 text-ink-ghost" />
                <span>Created {formatDate(pack.created_at)}</span>
              </div>
              <div className="text-xs text-ink-light font-sans">
                <span className="font-semibold text-ink">Channels: </span>
                <span className="text-ink-light">{getPlatformsListString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="gray">#creatoreconomy</Badge>
              <Badge variant="gray">#mindset</Badge>
              <Badge variant="gray">#scaling</Badge>
            </div>
          </Card>

          <ViralityScoreMeter score={pack.final_virality_score} />
          <ReviewActions
            status={pack.status}
            onApprove={handleApprove}
            onEditToggle={() => setIsEditingScript(!isEditingScript)}
            isEditing={isEditingScript}
            onRegenerate={(inputText) => handleRegenerate(inputText)}
            onDiscard={handleDiscard}
          />
        </div>
        <div className="lg:col-span-6">
          <ContentPackViewer pack={pack} isEditing={isEditingScript} onUpdatePack={updatePack} />
        </div>
      </div>
    </div>
  );
}
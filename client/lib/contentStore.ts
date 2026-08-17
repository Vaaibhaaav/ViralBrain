import { create } from "zustand";
import { ContentPack, UserProfile, AgentStatus, Platform, Hook, GenerationSettings } from "./types";
import { INITIAL_AGENTS } from "./mockData";
import { api } from "./axios";
import { fetchPreviousScripts, createScript } from "@/database/actions/script";
import { useUserStore } from "./userStore";

interface ContentStore {
  packs: ContentPack[];
  activePack: ContentPack | null;
  userProfile: UserProfile;
  agentProgress: AgentStatus[];
  isGenerating: boolean;
  isLoading: boolean;
  generatingPackId: string | null;
  viralityScoreTeaser: number;

  fetchPacks: (userId: string) => Promise<void>;
  setUserProfile: (profile: UserProfile) => void;
  createPack: (
    topic: string,
    settings: GenerationSettings,
    platforms: Platform[],
    onStepComplete?: (stepIndex: number) => void,
    onComplete?: (packId: string) => void
  ) => Promise<{
    status: string;
    data: ContentPack;
  }>;
  setActivePack: (pack: ContentPack | null) => void;
  updatePackTitle: (id: string, topic: string) => void;
  updatePack: (pack: ContentPack) => void;
  approvePack: (id: string, thread_id: string, draft_script: string, creatorId: string) => Promise<void>;
  promoteHook: (packId: string, hookId: string) => void;
  updateCaption: (packId: string, platform: Platform, text: string) => void;
  updatePackFeedback: (id: string, thread_id: string, human_feedback: string) => Promise<void>;
  updateHashtags: (packId: string, platform: Platform, tags: string[]) => void;
  discardPack: (id: string) => void;
  clearVoiceProfile: () => void;
  updateDefaultSettings: (settings: GenerationSettings) => void;
}

const EMPTY_USER_PROFILE: UserProfile = {
  id: "",
  name: "Creator",
  email: "",
  plan: "free",
  packs_created: 0,
  voice_vectors: 0,
  approval_rate: 100,
  connected_platforms: ["youtube", "tiktok", "instagram", "twitter", "linkedin"],
  default_settings: {
    topic_details: "",
    niche: "",
    preferred_language: "English",
    target_audience: "",
    primary_platform: "youtube",
    preferred_personalized_output: true,
  },
};

function mapDbScriptToContentPack(row: any): ContentPack {
  const s = row.scripts;
  const p = row.production_assets;
  const packId = s.id;
  const mainScore = s.viralityScore || 50;

  const titleVariants = (p.titleVariants || []).map((t: string) => ({
    title: t,
    psychology_type: "curiosity gap"
  }));

  const abHooks = p.abSplitHooks || [];
  const hooks = abHooks.map((text: string, index: number) => ({
    id: `${packId}_h${index + 1}`,
    text,
    variant: index === 0 ? "a" : "b",
    score: index === 0 ? mainScore : Math.max(50, mainScore - 5),
    is_top: index === 0,
  }));

  const twitterPayload = (p.twitterThread || []).map((t: any) => ({
    tweet_number: t.id || t.tweet_number,
    tweet_text: t.text || t.tweet_text
  }));

  const captions: Record<string, string> = {
    linkedin: p.linkedinPost || "",
    twitter: (p.twitterThread || []).map((t: any) => t.text || t.tweet_text).join('\n\n'),
  };

  const platforms: Platform[] = ["linkedin", "twitter"];
  const hashtagsMap: Record<string, string[]> = {
    linkedin: p.seoMetadata?.tags || [],
    twitter: p.seoMetadata?.tags || [],
  };

  const scheduleMap: Record<string, string> = {
    linkedin: "Scheduled",
    twitter: "Scheduled",
  };

  const thumbnailBrief = {
    concept: `Split graphic demonstrating the core concept of "${s.topic}".`,
    textOverlay: {
      large: s.topic.slice(0, 30).toUpperCase(),
      small: "VIRAL FORMULA"
    },
    expression: "Confident and composed.",
    colors: ["#3E6B47", "#1A1A18", "#F7F4EF"],
    referenceStyle: "Minimalist editorial look"
  };

  return {
    id: s.id,
    topic: s.topic,
    created_at: typeof s.createdAt === 'string' ? s.createdAt : (s.createdAt.toISOString ? s.createdAt.toISOString() : new Date(s.createdAt).toISOString()),
    status: s.status === 'completed' ? 'approved' : 'review',
    platforms,
    thread_id: s.id,
    topic_details: s.topicDetails || "",
    final_virality_score: mainScore,
    virality_score: mainScore,
    audit_logs: s.scoreReasoning || "",
    total_revision_cycles: s.totalRevisionCycles,
    top_angles: hooks,
    viral_templates: {},
    script_draft: p.finalScriptText,
    score_reason: s.scoreReasoning || "",
    retry_count: s.totalRevisionCycles + 1,
    title_variants: titleVariants,
    ab_pair: abHooks,
    linkedin_post: p.linkedinPost,
    twitter_thread: twitterPayload,
    seo_metadata: p.seoMetadata?.description || "",
    primary_keywords: p.seoMetadata?.primaryKeywords || [],
    viral_hashtags: (p.seoMetadata?.tags || []).map((tag: string) => ({
      tag,
      volume_tier: "Medium",
      strategic_purpose: "Growth"
    })),
    human_feedback: null,
    hooks,
    captions,
    hashtags: hashtagsMap,
    schedule: scheduleMap,
    thumbnail_brief: thumbnailBrief
  };
}

export const useContentStore = create<ContentStore>((set, get) => ({
  packs: [],
  activePack: null,
  userProfile: EMPTY_USER_PROFILE,
  agentProgress: INITIAL_AGENTS.map(a => ({ ...a })),
  isGenerating: false,
  isLoading: true,
  generatingPackId: null,
  viralityScoreTeaser: 0,

  setActivePack: (pack) => set({ activePack: pack }),

  setUserProfile: (profile) => set({ userProfile: profile }),

  fetchPacks: async (userId) => {
    try {
      set({ isLoading: true });
      const dbPacks = await fetchPreviousScripts(userId, 50);
      const mapped = dbPacks.map(mapDbScriptToContentPack);

      set((state) => {
        const dbIds = new Set(mapped.map((p) => p.id));
        const localOnly = state.packs.filter((p) => !dbIds.has(p.id));
        return { packs: [...localOnly, ...mapped], isLoading: false };
      });
    } catch (error) {
      console.log("No packs fetched or error:", error);
      set({ isLoading: false });
    }
  },

  createPack: async (topic, settings, platforms, onStepComplete, onComplete) => {
    const packId = `pack_${Date.now()}`;
    const initialScore = Math.floor(Math.random() * 30) + 65;

    const newPack: ContentPack = {
      id: packId,
      topic,
      created_at: new Date().toISOString(),
      status: "generating",
      platforms,
      topic_details: settings.topic_details,
      niche: settings.niche,
      preferred_language: settings.preferred_language,
      target_audience: settings.target_audience,
      primary_platform: settings.primary_platform,
      preferred_personalized_output: settings.preferred_personalized_output,
      final_virality_score: initialScore,
      audit_logs: "Initiating trend scouting agents scan...",
      total_revision_cycles: 0,
      top_angles: [
        { id: `${packId}_h1`, text: topic, variant: "a", score: initialScore, is_top: true }
      ],
      viral_templates: {},
      script_draft: "",
      virality_score: initialScore,
      score_reason: "Pre-scoring script configurations...",
      retry_count: 1,
      title_variants: [],
      ab_pair: [topic, `Alternative hook variant for ${topic}`],
      linkedin_post: "",
      twitter_thread: [],
      seo_metadata: "",
      primary_keywords: [settings.niche],
      viral_hashtags: [],
      human_feedback: null,
    };

    set({
      isGenerating: true,
      generatingPackId: packId,
      viralityScoreTeaser: 0,
      agentProgress: INITIAL_AGENTS.map(a => ({ ...a, status: "waiting", progress: 0, output_summary: undefined })),
      packs: [newPack, ...get().packs]
    });

    console.log("STARTING AGENTIC REQUEST TO BACKEND");

    let simulatedProgress = [...INITIAL_AGENTS.map(a => ({ ...a }))];
    let currentAgentIndex = 0;
    let percent = 0;

    const progressTimer = setInterval(() => {
      if (currentAgentIndex < simulatedProgress.length) {
        percent += 20;
        if (percent > 100) {
          simulatedProgress[currentAgentIndex] = {
            ...simulatedProgress[currentAgentIndex],
            status: "complete",
            progress: 100,
          };
          currentAgentIndex++;
          percent = 0;
        } else {
          simulatedProgress[currentAgentIndex] = {
            ...simulatedProgress[currentAgentIndex],
            status: "running",
            progress: percent,
          };
        }
        set({ agentProgress: [...simulatedProgress] });
      }
    }, 200);

    let response;
    const creatorId = useUserStore.getState().user?.id || "creator_vaibhav_001";

    try {
      response = await api.post('/api/v1/generate/script', {
        creator_id: creatorId,
        topic: topic,
        topic_details: settings.topic_details,
        niche: settings.niche,
        preferred_language: settings.preferred_language,
        target_audience: settings.target_audience,
        primary_platform: settings.primary_platform,
        preferred_personalized_output: settings.preferred_personalized_output,
      });
    } catch (error) {
      console.error("Error generating content pack:", error);
      set((state) => ({
        isGenerating: false,
        generatingPackId: null,
        packs: state.packs.filter((p) => p.id !== packId), // drop the failed placeholder
        generationError: "Something went wrong generating your pack. Please try again.",
      }));
      throw error;
    } finally {
      clearInterval(progressTimer);
    }

    const thread_id = response.data.thread_id;
    const backendData = response.data.data;
    const productionAssets = backendData.production_assets || {};
    const seoIndexing = productionAssets.seo_indexing || {};

    const trendingTags = seoIndexing.trending_tags || [];
    const hashtagsList = trendingTags.map((t: any) => t.tag.startsWith('#') ? t.tag.slice(1) : t.tag);

    const captions: Record<string, string> = {
      linkedin: productionAssets.linkedin_copy || "",
      twitter: productionAssets.twitter_thread_payload
        ? productionAssets.twitter_thread_payload.map((t: any) => t.tweet_text).join('\n\n')
        : "",
    };

    const rawScript = productionAssets.script_draft || "";
    const cleanScript = rawScript
      .replace(/🎬 VISUAL:[^\n]*/g, "")
      .replace(/🎙️ AUDIO[^:]*:/g, "")
      .replace(/###[^\n]*/g, "")
      .replace(/⏱️[^\n]*/g, "")
      .replace(/---[^\n]*/g, "")
      .trim();

    platforms.forEach(platform => {
      if (!captions[platform]) {
        if (platform === 'twitter') {
          captions[platform] = cleanScript.slice(0, 240) + "...";
        } else if (platform === 'linkedin') {
          captions[platform] = cleanScript;
        } else {
          captions[platform] = `${topic}\n\n${cleanScript.slice(0, 150)}...\n\n#${(settings.niche || "productivity").toLowerCase()} #creatoreconomy`;
        }
      }
    });

    const hashtagsMap: Record<string, string[]> = {};
    platforms.forEach(platform => {
      hashtagsMap[platform] = hashtagsList.length > 0 ? hashtagsList : [(settings.niche || "productivity").toLowerCase(), "creatoreconomy"];
    });

    const scheduleMap: Record<string, string> = {};
    platforms.forEach(platform => {
      scheduleMap[platform] = "Scheduled Tomorrow";
    });

    const abHooks = productionAssets.ab_split_hooks || [];
    const mainScore = backendData.final_virality_score || 50;
    const hooks = abHooks.map((text: string, index: number) => ({
      id: `${packId}_h${index + 1}`,
      text,
      variant: index === 0 ? "a" : "b",
      score: index === 0 ? mainScore : Math.max(50, mainScore - Math.floor(Math.random() * 10) - 1),
      is_top: index === 0,
    }));

    const shortTitle = productionAssets.title_packaging?.[0]?.title || topic.slice(0, 30);
    const thumbnailBrief = {
      concept: `Split graphic demonstrating the core concept of "${topic}". High visual contrast focusing on premium layout aesthetics.`,
      textOverlay: {
        large: shortTitle.toUpperCase(),
        small: "THE EFFICIENCY LOOP"
      },
      expression: `Confident and composed, projecting authority and clarity in a premium workspace setting.`,
      colors: ["#3E6B47", "#C94C3A", "#F7F4EF", "#1A1A18"],
      referenceStyle: "Minimalist editorial look, soft grains, warm lighting."
    };

    const finalPack: ContentPack = {
      ...newPack,
      status: "review",
      thread_id: thread_id,
      final_virality_score: backendData.final_virality_score,
      virality_score: backendData.final_virality_score,
      audit_logs: backendData.audit_logs,
      total_revision_cycles: backendData.total_revision_cycles,
      script_draft: productionAssets.script_draft,
      title_variants: productionAssets.title_packaging,
      ab_pair: productionAssets.ab_split_hooks,
      linkedin_post: productionAssets.linkedin_copy,
      twitter_thread: productionAssets.twitter_thread_payload,
      seo_metadata: seoIndexing.meta_description,
      primary_keywords: seoIndexing.primary_keywords,
      viral_hashtags: seoIndexing.trending_tags,
      hooks,
      captions,
      hashtags: hashtagsMap,
      schedule: scheduleMap,
      thumbnail_brief: thumbnailBrief,
      title_packaging: productionAssets.title_packaging,
      ab_split_hooks: productionAssets.ab_split_hooks,
      linkedin_copy: productionAssets.linkedin_copy,
      twitter_thread_payload: productionAssets.twitter_thread_payload,
      seo_indexing: productionAssets.seo_indexing,
    };

    const finalSummaries = [
      `Found trending hooks in ${(settings.niche || "solopreneurship")}`,
      "Matched style signature to past profiles",
      `Drafted pacing strategy with visual & audio script lineup`,
      `Final Virality Score: ${backendData.final_virality_score}/100`,
      `Generated ${productionAssets.title_packaging?.length || 3} click-optimized titles`,
      `Adapted copy to ${platforms.join(", ")} formats`,
      `Optimized keywords: ${(seoIndexing.primary_keywords || []).slice(0, 3).join(", ")}`,
      "Saved voice patterns to vector profile db"
    ];

    const completedAgents = INITIAL_AGENTS.map((agent, index) => ({
      ...agent,
      status: "complete" as const,
      progress: 100,
      output_summary: finalSummaries[index]
    }));

    set((state) => {
      const updatedPacks = state.packs.map(p => p.id === packId ? finalPack : p);
      const localProfile = {
        ...state.userProfile,
        packs_created: updatedPacks.length,
        voice_vectors: state.userProfile.voice_vectors + 80
      };
      const currentStoreUser = useUserStore.getState().user;
      if (currentStoreUser) {
        useUserStore.getState().setUser({
          ...currentStoreUser,
          packs_created: updatedPacks.length,
          voice_vectors: currentStoreUser.voice_vectors ? currentStoreUser.voice_vectors + 80 : 80
        });
      }

      return {
        packs: updatedPacks,
        activePack: finalPack,
        isGenerating: false,
        generatingPackId: null,
        agentProgress: completedAgents,
        viralityScoreTeaser: finalPack.virality_score || 50,
        userProfile: localProfile
      };
    });

    if (onComplete) onComplete(finalPack.id);

    return {
      status: "success",
      data: finalPack
    };
  },

  updatePackFeedback: async (id, thread_id, human_feedback) => {
    set({
      isGenerating: true,
      generatingPackId: id,
      agentProgress: INITIAL_AGENTS.map(a => ({ ...a, status: "waiting", progress: 0, output_summary: undefined })),
    });

    let simulatedProgress = [...INITIAL_AGENTS.map(a => ({ ...a }))];
    let currentAgentIndex = 0;
    let percent = 0;

    const progressTimer = setInterval(() => {
      if (currentAgentIndex < simulatedProgress.length) {
        percent += 20;
        if (percent > 100) {
          simulatedProgress[currentAgentIndex] = {
            ...simulatedProgress[currentAgentIndex],
            status: "complete",
            progress: 100,
          };
          currentAgentIndex++;
          percent = 0;
        } else {
          simulatedProgress[currentAgentIndex] = {
            ...simulatedProgress[currentAgentIndex],
            status: "running",
            progress: percent,
          };
        }
        set({ agentProgress: [...simulatedProgress] });
      }
    }, 200);

    try {
      const response = await api.post("/api/v1/generate/review", {
        thread_id,
        chat_feedback: human_feedback || "Make the script more dramatic and interesting",
        approve_final: false,
      });

      // DEBUG: log the raw response so a mismatched shape or unexpected
      // status string is visible instead of silently no-op'ing below.
      console.log("[updatePackFeedback] raw response:", JSON.stringify(response.data, null, 2));

      const status = response.data.status;
      const backendData = response.data.data ?? response.data;
      const productionAssets = backendData?.production_assets || {};
      const seoIndexing = productionAssets.seo_indexing || {};

      const validStatuses = ["success", "paused_at_next_checkpoint", "execution_complete", "paused_at_review"];
      if (status && !validStatuses.includes(status) && !productionAssets.script_draft) {
        console.warn(
          `[updatePackFeedback] Unexpected status "${status}" and no script_draft found — skipping pack update.`,
          response.data
        );
        return;
      }

      if (!productionAssets.script_draft) {
        console.warn(
          "[updatePackFeedback] No script_draft found in response.production_assets — " +
          "the store will keep the existing script. Check that the API actually returns " +
          "an updated script_draft for this endpoint.",
          backendData
        );
      }

      set((state) => {
        const existingPack = state.packs.find(p => p.id === id);
        if (!existingPack) {
          console.warn(`[updatePackFeedback] No pack found in store with id "${id}" — update dropped.`);
          return {};
        }

        const trendingTags = seoIndexing.trending_tags || [];
        const hashtagsList = trendingTags.map((t: any) =>
          t.tag?.startsWith('#') ? t.tag.slice(1) : t.tag
        );

        const captions = {
          ...existingPack.captions,
          linkedin: productionAssets.linkedin_copy ?? existingPack.captions?.linkedin ?? "",
          twitter: productionAssets.twitter_thread_payload
            ? productionAssets.twitter_thread_payload.map((t: any) => t.tweet_text).join('\n\n')
            : existingPack.captions?.twitter ?? "",
        };

        const hashtagsMap = { ...existingPack.hashtags };
        (existingPack.platforms || []).forEach((platform) => {
          hashtagsMap[platform] = hashtagsList.length > 0 ? hashtagsList : (hashtagsMap[platform] || []);
        });

        const abHooks = productionAssets.ab_split_hooks || existingPack.ab_pair || [];
        const mainScore = backendData.final_virality_score ?? existingPack.virality_score;
        const hooks = abHooks.map((text: string, index: number) => ({
          id: `${id}_h${index + 1}`,
          text,
          variant: index === 0 ? "a" : "b",
          score: index === 0 ? mainScore : Math.max(50, mainScore - Math.floor(Math.random() * 10) - 1),
          is_top: index === 0,
        }));

        const updatedPack: ContentPack = {
          ...existingPack,
          status: "review",
          human_feedback,
          final_virality_score: mainScore,
          virality_score: mainScore,
          audit_logs: backendData.audit_logs ?? existingPack.audit_logs,
          total_revision_cycles: backendData.total_revision_cycles ?? existingPack.total_revision_cycles,
          script_draft: productionAssets.script_draft ?? existingPack.script_draft,
          title_variants: productionAssets.title_packaging ?? existingPack.title_variants,
          ab_pair: abHooks,
          linkedin_post: productionAssets.linkedin_copy ?? existingPack.linkedin_post,
          twitter_thread: productionAssets.twitter_thread_payload ?? existingPack.twitter_thread,
          seo_metadata: seoIndexing.meta_description ?? existingPack.seo_metadata,
          primary_keywords: seoIndexing.primary_keywords ?? existingPack.primary_keywords,
          viral_hashtags: seoIndexing.trending_tags ?? existingPack.viral_hashtags,
          hooks,
          captions,
          hashtags: hashtagsMap,
          title_packaging: productionAssets.title_packaging ?? existingPack.title_packaging,
          ab_split_hooks: abHooks,
          linkedin_copy: productionAssets.linkedin_copy ?? existingPack.linkedin_copy,
          twitter_thread_payload: productionAssets.twitter_thread_payload ?? existingPack.twitter_thread_payload,
          seo_indexing: productionAssets.seo_indexing ?? existingPack.seo_indexing,
        };

        const updatedPacks = state.packs.map(p => (p.id === id ? updatedPack : p));
        // Always resync activePack from the freshly updated pack when ids match,
        // rather than relying on a stale reference — this is what the
        // script editor / preview components read from.
        const active = state.activePack?.id === id ? updatedPack : state.activePack;

        return {
          packs: updatedPacks,
          activePack: active,
          agentProgress: INITIAL_AGENTS.map(a => ({ ...a, status: "complete" as const, progress: 100 })),
        };
      });
    } catch (error) {
      console.error("Error updating pack feedback:", error);
    } finally {
      set({ isGenerating: false, generatingPackId: null });
      clearInterval(progressTimer);
    }
  },

  updatePackTitle: (id, topic) => set((state) => {
    const updated = state.packs.map(p => p.id === id ? { ...p, topic } : p);
    const active = state.activePack?.id === id ? { ...state.activePack, topic } : state.activePack;
    return { packs: updated, activePack: active };
  }),

  updatePack: (pack) => set((state) => {
    const updated = state.packs.map(p => p.id === pack.id ? pack : p);
    const active = state.activePack?.id === pack.id ? pack : state.activePack;
    return { packs: updated, activePack: active };
  }),

  approvePack: async (id, thread_id, draft_script, creatorId) => {
    await api.post("/api/v1/generate/review", {
      thread_id,
      edited_script: draft_script,
      approve_final: true,
    });

    const packBeforePersist = useContentStore.getState().packs.find(p => p.id === id);
    if (!packBeforePersist) return;

    let persistedId = id;

    try {
      const scriptReq = {
        topic: packBeforePersist.topic,
        topicDetails: packBeforePersist.topic_details || "",
        status: 'paused_at_review' as const,
        viralityScore: packBeforePersist.virality_score,
        scoreReasoning: packBeforePersist.audit_logs,
        totalRevisionCycles: packBeforePersist.total_revision_cycles,
        finalScriptText: packBeforePersist.script_draft,
        titleVariants: (packBeforePersist.title_variants || []).map((t: any) => typeof t === 'string' ? t : t.title),
        abSplitHooks: (packBeforePersist.ab_pair || ["", ""]) as [string, string],
        linkedinPost: packBeforePersist.linkedin_post || "",
        twitterThread: (packBeforePersist.twitter_thread || []).map((t: any) => ({
          id: t.tweet_number || t.id,
          text: t.tweet_text || t.text
        })),
        seoMetadata: {
          description: packBeforePersist.seo_metadata || "",
          primaryKeywords: packBeforePersist.primary_keywords || [],
          tags: (packBeforePersist.viral_hashtags || []).map((t: any) => typeof t === 'string' ? t : t.tag),
        }
      };

      const dbResult = await createScript(scriptReq, creatorId);
      if (dbResult?.insertedScript) {
        persistedId = dbResult.insertedScript.id;
      }
    } catch (dbError) {
      console.error("Failed to persist generated script to Neon database:", dbError);
    }

    set((state) => {
      const updated = state.packs.map((p) =>
        p.id === id ? { ...p, id: persistedId, status: "approved" as const } : p
      );

      const active =
        state.activePack?.id === id
          ? { ...state.activePack, id: persistedId, status: "approved" as const }
          : state.activePack;

      const approvedPacks = updated.filter(
        (p) => p.status === "approved" || p.status === "published"
      ).length;

      const approvalRate = updated.length > 0
        ? Math.round((approvedPacks / updated.length) * 100)
        : 100;

      const localProfile = {
        ...state.userProfile,
        approval_rate: approvalRate,
        voice_vectors: state.userProfile.voice_vectors + 120,
      };

      const currentStoreUser = useUserStore.getState().user;
      if (currentStoreUser) {
        useUserStore.getState().setUser({
          ...currentStoreUser,
          approval_rate: approvalRate,
          voice_vectors: currentStoreUser.voice_vectors ? currentStoreUser.voice_vectors + 120 : 120
        });
      }

      return { packs: updated, activePack: active, userProfile: localProfile };
    });
  },

  promoteHook: (packId: string, hookId: string) => set((state) => {
    const pack = state.packs.find(p => p.id === packId);
    if (!pack) return {};

    const chosenHook = pack.hooks?.find(h => h.id === hookId);
    let updatedScript = pack.script_draft;

    if (chosenHook && pack.script_draft) {
      const hookMatch = pack.script_draft.match(/\[HOOK\]([\s\S]*?)(?=\n\n\[BODY\]|\[BODY\]|$)/i);
      if (hookMatch) {
        updatedScript = pack.script_draft.replace(
          /\[HOOK\]([\s\S]*?)(?=\n\n\[BODY\]|\[BODY\]|$)/i,
          `[HOOK]\n${chosenHook.text}`
        );
      }
    }

    const updatedHooks = pack.hooks?.map(h => ({
      ...h,
      is_top: h.id === hookId
    })) || [];

    const updatedPack: ContentPack = {
      ...pack,
      hooks: updatedHooks,
      script_draft: updatedScript,
      virality_score: chosenHook ? chosenHook.score : pack.virality_score
    };

    const updatedPacks = state.packs.map(p => p.id === packId ? updatedPack : p);
    const active = state.activePack?.id === packId ? updatedPack : state.activePack;

    return { packs: updatedPacks, activePack: active };
  }),

  updateCaption: (packId, platform, text) => set((state: any) => {
    const pack = state.packs?.find((p: any) => p.id === packId);
    if (!pack) return {};

    const updatedPack = {
      ...pack,
      captions: {
        ...pack.captions,
        [platform]: text
      }
    };

    const updatedPacks = state.packs?.map((p: any) => p.id === packId ? updatedPack : p);
    const active = state.activePack?.id === packId ? updatedPack : state.activePack;

    return { packs: updatedPacks, activePack: active };
  }),

  updateHashtags: (packId, platform, tags) => set((state: any) => {
    const pack = state.packs.find((p: any) => p.id === packId);
    if (!pack) return {};

    const updatedPack = {
      ...pack,
      hashtags: {
        ...pack.hashtags,
        [platform]: tags
      }
    };

    const updatedPacks = state.packs?.map((p: any) => p.id === packId ? updatedPack : p);
    const active = state.activePack?.id === packId ? updatedPack : state.activePack;

    return { packs: updatedPacks, activePack: active };
  }),

  discardPack: (id) => set((state) => {
    const updated = state.packs.filter(p => p.id !== id);
    const active = state.activePack?.id === id ? null : state.activePack;
    return { packs: updated, activePack: active };
  }),

  clearVoiceProfile: () => set((state) => ({
    userProfile: {
      ...state.userProfile,
      voice_vectors: 0
    }
  })),

  updateDefaultSettings: (settings: GenerationSettings) => set((state) => ({
    userProfile: {
      ...state.userProfile,
      default_settings: settings
    }
  }))
}));
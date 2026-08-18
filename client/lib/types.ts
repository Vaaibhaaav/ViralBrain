export interface User {
  id?: string;
  email?: string;
  fullName?: string;
  tier?: "free" | "premium" | "enterprise",
  creator_profile_id?: string;
  niche?: string;
  targetAudience?: string;
  preferredLanguage?: string;
  primaryPlatform?: string;
}

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'linkedin';

export interface Hook {
  id: string;
  text: string;
  variant?: string;
  score: number;
  is_top: boolean;
}

export interface ThumbnailBrief {
  concept: string;
  textOverlay: {
    large: string;
    small: string;
  };
  expression: string;
  colors: string[];
  referenceStyle: string;
}


export interface GenerationSettings {
  topic_details: string;
  niche: string;
  preferred_language: string;
  target_audience: string;
  primary_platform: Platform;
  preferred_personalized_output: boolean;
}

export interface ContentPack {
  id: string;
  topic: string;
  created_at: string;
  status: 'generating' | 'review' | 'approved' | 'published';
  platforms: Platform[];
  thread_id?: string;

  topic_details?: string;
  niche?: string;
  preferred_language?: string;
  target_audience?: string;
  primary_platform?: Platform;
  preferred_personalized_output?: boolean;

  final_virality_score: number;
  audit_logs: string;
  total_revision_cycles: number;

  top_angles: Hook[];
  viral_templates: Record<string, any>;
  script_draft: string;
  virality_score: number;
  score_reason: string;
  retry_count: number;

  title_variants: [string, string][] | { title: string; psychology_type: string }[];
  ab_pair: [string, string] | string[];

  linkedin_post: string;
  twitter_thread: [string, string][] | { tweet_number: number; tweet_text: string }[];

  seo_metadata: string;
  primary_keywords: string[];
  viral_hashtags: [string, string][] | { tag: string; volume_tier: string; strategic_purpose: string }[];

  human_feedback: string | null;

  // Added fields for mock & UI compatibility:
  hooks?: Hook[];
  captions?: Record<string, string>;
  hashtags?: Record<string, string[]>;
  schedule?: Record<string, string>;
  thumbnail_brief?: ThumbnailBrief;

  // Raw Backend Response Payload Fields
  title_packaging?: { title: string; psychology_type: string }[];
  ab_split_hooks?: string[];
  linkedin_copy?: string;
  twitter_thread_payload?: { tweet_number: number; tweet_text: string }[];
  seo_indexing?: {
    meta_description: string;
    primary_keywords: string[];
    trending_tags: { tag: string; volume_tier: string; strategic_purpose: string }[];
  };
}

export interface AgentStatus {
  id: string;
  name: string;
  description: string;
  status: 'waiting' | 'running' | 'complete' | 'error';
  progress: number;
  output_summary?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  plan: 'free' | 'pro';
  packs_created: number;
  voice_vectors: number;
  approval_rate: number;
  connected_platforms: Platform[];
  default_settings: GenerationSettings;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  type: 'text' | 'action_card' | 'pack_preview' | 'score_comparison';
  client_message_id?: string;
  intent?: string;
  grounded?: boolean;
  guardrail_flags?: string[];
  isProcessing?: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: string;
  };
}

export interface ChatContext {
  current_page: string;
  active_pack_id?: string;
  active_pack_topic?: string;
  active_pack_score?: number;
  agent_status?: AgentStatus[];
}

export interface ChatbotMessagePayload {
  thread_id: string;
  creator_id: string;
  client_message_id?: string | null;
  user_message: string;
  metadata?: Record<string, any> | null;
  niche?: string | null;
}

export interface ChatbotMessageResponse {
  thread_id: string;
  reply: string;
  intent?: string | null;
  grounded?: boolean | null;
  guardrail_flags: string[];
}

export interface PreviousChats {
  thread_id: string;
  creator_id: string;
  summary: string;
  recent_messages: string[],
  total_message_count: number
}
import { ContentPack, UserProfile, AgentStatus, Platform } from "./types";

export const MOCK_USER: UserProfile = {
  id: "user_1",
  name: "Sarah K.",
  email: "sarah@viralbrain.ai",
  avatar_url: "/avatar.png", // We will render a nice initials avatar fallback
  plan: "pro",
  packs_created: 12,
  voice_vectors: 3840,
  approval_rate: 89,
  connected_platforms: ["youtube", "tiktok", "instagram", "twitter"],
  default_settings: {
    topic_details: "Why trading hours for views manually causes burnouts.",
    niche: "Solopreneurship",
    preferred_language: "English",
    target_audience: "Mid-tier creators (5k to 20k followers)",
    primary_platform: "youtube",
    preferred_personalized_output: true,
  },
};

export const INITIAL_AGENTS: AgentStatus[] = [
  {
    id: "agent_1",
    name: "Trend Scout Agent",
    description: "Scanning Reddit & YouTube for viral angles",
    status: "waiting",
    progress: 0,
  },
  {
    id: "agent_2",
    name: "DNA Scanner Agent",
    description: "Retrieving viral hook patterns from memory",
    status: "waiting",
    progress: 0,
  },
  {
    id: "agent_3",
    name: "Script Writer Agent",
    description: "Drafting in your voice using past approved content",
    status: "waiting",
    progress: 0,
  },
  {
    id: "agent_4",
    name: "Virality Scorer",
    description: "Scoring hooks against 10k+ data points",
    status: "waiting",
    progress: 0,
  },
  {
    id: "agent_5",
    name: "A/B Title Generator",
    description: "Creating 8 click-optimized title variants",
    status: "waiting",
    progress: 0,
  },
  {
    id: "agent_6",
    name: "Platform Adapter",
    description: "Writing platform-native versions for 5 channels",
    status: "waiting",
    progress: 0,
  },
  {
    id: "agent_7",
    name: "SEO & Hashtag Agent",
    description: "Building keyword and hashtag strategy",
    status: "waiting",
    progress: 0,
  },
  {
    id: "agent_8",
    name: "Voice Memory Agent",
    description: "Saving patterns to your style profile",
    status: "waiting",
    progress: 0,
  },
];

export const MOCK_PACKS = [
  {
    id: "pack_1",
    thread_id: "lalalala",
    topic: "Why most creators quit at 10k followers — and the mindset shift that changes everything",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    status: "review",
    virality_score: 87,
    platforms: ["tiktok", "instagram", "youtube", "twitter"],
    script_draft: `[HOOK]
I used to spend 8 hours on a single post. Now it's 4 minutes. And the secret isn't some fancy editing trick, it's the mindset shift at the 10k milestone. Most creators hit 10k and think they've won, but that's actually where the real work begins.

[BODY]
Here's the trap: between 0 and 10k followers, you survive on pure novelty. People follow because you're new and refreshing. But to get from 10k to 100k, you have to transition from a "novelty" to an "institution." You need a repeatable system. You need to treat your content like an operating system, not a diary. If you keep trading time for views manually, you will burn out.

[CTA]
If you're stuck in the 10k trench, click my link. I've compiled the exact 3 systems I used to scale past 10k without losing my sanity. Let's make it easy.`,
    hooks: [
      { id: "h1", text: "I used to spend 8 hours on a single post. Now it's 4 minutes.", variant: "a", score: 87, is_top: true },
      { id: "h2", text: "Why 92% of creators quit exactly at 10,000 followers.", variant: "b", score: 81 },
      { id: "h3", text: "The 10k milestone is a death trap for your creative energy. Here's why.", variant: "c", score: 79 },
      { id: "h4", text: "How to run your entire creator business in 4 minutes a day.", variant: "d", score: 76 },
      { id: "h5", text: "Are you a creator or an editor? This shift will save your career.", variant: "e", score: 72 },
      { id: "h6", text: "If you're approaching 10k followers, watch this before it's too late.", variant: "f", score: 68 },
      { id: "h7", text: "The mindset shift that separates hobby creators from 7-figure businesses.", variant: "g", score: 65 },
      { id: "h8", text: "My 3-step operating system for scaling past 10k followers.", variant: "h", score: 60 }
    ],
    captions: {
      tiktok: "The 10k creator trap is real. If you're trading 8 hours for a single video, you're building a job, not a business. Here's the exact mindset shift to scale past 10,000 followers and build a content OS. 👇 #creatorstats #growthmindset #contentcreation",
      instagram: "Why do most creators quit at 10k followers? It's not because they run out of ideas. It's because they run out of time. Between 0 and 10k, you survive on novelty. To go to 100k, you need a system. Read the carousel to see the exact 3 systems I use to scale. 🚀\n\nDM me 'SCALE' and I'll send you my workflow template.",
      youtube: "Why Most Creators Quit at 10k Followers (And How to Fix It)\n\nIn this video, I break down the exact mindset trap that causes 92% of creators to burn out and quit once they reach 10,000 followers. We'll cover the difference between novelty content and institutional content, and how to build a repeatable operating system that works for you.",
      twitter: "Most creators burn out at 10k followers because they treat content like a diary, not an operating system.\n\nFrom 0 to 10k, you survive on novelty.\nFrom 10k to 100k, you survive on systems.\n\nHere is the 3-step framework to transition today: 👇 (1/5)",
      linkedin: "I used to spend 8 hours on a single post. Now it's 4 minutes.\n\nAt 10,000 followers, most creators make a fatal mistake: they double down on manual work instead of designing scalable processes.\n\nHere are the 3 content operating systems you need to build to transition from a 'hobby creator' to an 'institutional business':\n\n1. The Hook Repository\n2. The Distribution Matrix\n3. The Voice Profile Library\n\nWhich of these are you currently building? Let me know in the comments."
    },
    hashtags: {
      tiktok: ["creatorstats", "growthmindset", "contentcreation", "viralhooks"],
      instagram: ["creatorlifestyle", "creatoreconomy", "systemsbuilding", "scalingtips"],
      youtube: ["creatoreconomy", "burnoutprevention", "youtubetips", "socialmediastrategy"],
      twitter: ["creatoreconomy", "productivity", "growth"],
      linkedin: ["contentstrategy", "creatoreconomy", "businessscaling", "productivity"]
    },
    thumbnail_brief: {
      concept: "Split face graphic comparing Stress vs. Serenity. On the left: close-up of a stressed creator with a dark, high-contrast background and text '8 HOURS'. On the right: calm creator in warm, bright studio lighting with text '4 MINUTES'.",
      textOverlay: {
        large: "8 HOURS vs. 4 MINS",
        small: "The Creator Scale Trap"
      },
      expression: "Stressed and overwhelmed (left) transitioning to confident and composed (right).",
      colors: ["#3E6B47", "#C94C3A", "#F7F4EF", "#1A1A18"],
      referenceStyle: "Minimalist editorial look, soft grains, warm lighting, Instrument Serif font styling for overlays."
    },
    schedule: {
      tiktok: "Tomorrow at 9:30 AM",
      instagram: "Tomorrow at 4:00 PM",
      youtube: "Monday at 10:00 AM",
      twitter: "Tomorrow at 8:00 AM",
      linkedin: "Monday at 8:30 AM"
    }
  },
  {
    id: "pack_2",
    topic: "The 3-step Hooks framework that generated $150k in pipeline value",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: "published",
    virality_score: 92,
    platforms: ["linkedin", "twitter"],
    script_draft: `[HOOK]
I've analyzed 500+ high-performing B2B posts. The results? 84% of their success comes down to the first 3 lines. I call this the Tri-Angle Hook Framework.

[BODY]
Here's the framework:
1. The Absurd Contrast: Place two opposite ideas side by side.
2. The Credibility Stake: Share a specific, verifiable metric.
3. The Open Loop: Ask a question that cannot be answered with yes or no.

If you don't use all three, you are leaving engagement on the table.

[CTA]
Want my checklist of the 20 pre-written Tri-Angle hook templates? Leave a comment below, and I'll send it over.`,
    hooks: [
      { id: "h2_1", text: "The 3-step Hooks framework that generated $150k in pipeline value.", variant: "a", score: 92, is_top: true },
      { id: "h2_2", text: "How to fix your B2B hooks in exactly 18 seconds.", variant: "b", score: 85 }
    ],
    captions: {
      tiktok: "",
      instagram: "",
      youtube: "",
      twitter: "The Tri-Angle Hook Framework that generated $150k in B2B pipeline:\n\n1. Absurd Contrast\n2. Credibility Stake\n3. Open Loop\n\nHere is how to write them: 👇",
      linkedin: "B2B writing isn't boring. Your hooks are.\n\nAfter analyzing 500+ posts, we found that 84% of B2B performance rests on the initial 3 lines.\n\nHere is the 'Tri-Angle' Hook framework we use to generate high-quality pipeline: ..."
    },
    hashtags: {
      tiktok: [],
      instagram: [],
      youtube: [],
      twitter: ["copywriting", "marketing", "growth"],
      linkedin: ["marketing", "b2bsales", "copywriting"]
    },
    thumbnail_brief: {
      concept: "Dark clean canvas with handwritten green math equations proving pipeline value, with bold text overlay.",
      textOverlay: {
        large: "$150K HOOK FORMULA",
        small: "Copywriting Math"
      },
      expression: "None - visual text-only premium layout",
      colors: ["#3E6B47", "#1A1A18", "#EFE9DF"],
      referenceStyle: "Linear.app style dark canvas with glowing green accents"
    },
    schedule: {
      tiktok: "",
      instagram: "",
      youtube: "",
      twitter: "Published 3 days ago",
      linkedin: "Published 3 days ago"
    }
  },
  {
    id: "pack_3",
    topic: "Stop editing your videos like it's 2022. Do this instead.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: "published",
    virality_score: 74,
    platforms: ["tiktok", "instagram", "youtube"],
    script_draft: `[HOOK]
The fast-paced, high-zoom editing style of 2022 is officially dead. If you're still using flashing emojis and sound effects every 1.5 seconds, you're turning off mature viewers.

[BODY]
Audiences are experiencing edit-fatigue. The new meta is "documentary realism" — soft natural lighting, longer takes (3-4 seconds), and high-quality foley sound. Stop trying to hypnotize your viewer. Focus on creating deep, slow interest.

[CTA]
Comment 'META' and I'll send you my Premiere Pro preset library matching the documentary-realism style.`,
    hooks: [
      { id: "h3_1", text: "Stop editing your videos like it's 2022. Do this instead.", variant: "a", score: 74, is_top: true },
      { id: "h3_2", text: "The flashy editing meta is dead. Here's what's replacing it.", variant: "b", score: 71 }
    ],
    captions: {
      tiktok: "Edit fatigue is real. If you're still adding 40 cuts a minute, you are turning off your best audience. Swap to documentary realism: clean colors, longer cuts, and soft foley. 🌿 #videoediting #premierepro #contenttips #documentarystyle",
      instagram: "Edit fatigue is real. The flashy style of 2022 is officially dead. Welcome to the era of 'documentary realism.' More authenticity, better aesthetics, longer viewer retention. Link in bio for my editing assets. 🎬",
      youtube: "Why Flashy Video Editing is Dead (The New Video Meta)\n\nIn this video, I explain why retention-hacking editing styles are actually hurting your channel growth in 2026. We look at the rise of the documentary-realism style and how you can implement it.",
      twitter: "",
      linkedin: ""
    },
    hashtags: {
      tiktok: ["videoediting", "premierepro", "contenttips", "documentarystyle"],
      instagram: ["filmmaking", "creativity", "videoeditingtips"],
      youtube: ["videoediting", "youtubecreator", "editingtips"],
      twitter: [],
      linkedin: []
    },
    thumbnail_brief: {
      concept: "Camera timeline showing an emoji with a big red X over it, placed next to a beautiful cinematic still of a creator.",
      textOverlay: {
        large: "EDIT META IS DEAD",
        small: "What to do instead"
      },
      expression: "Cinematic, calm, focusing on quality photography",
      colors: ["#1A1A18", "#C94C3A", "#D6E8D4"],
      referenceStyle: "Apple styling, warm tones, high dynamic range"
    },
    schedule: {
      tiktok: "Published 5 days ago",
      instagram: "Published 5 days ago",
      youtube: "Published 5 days ago",
      twitter: "",
      linkedin: ""
    }
  },
  {
    id: "pack_4",
    topic: "8 secrets about the LinkedIn algorithm they won't tell you",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved",
    virality_score: 83,
    platforms: ["linkedin"],
    script_draft: `[HOOK]
The LinkedIn algorithm doesn't care about your hashtags or the time you post. After studying 1,000 updates this quarter, here is what actually controls distribution.

[BODY]
First: Dwell time is key, but 'comment velocity' is the king. If your post doesn't get 5 comments in the first 10 minutes, the algorithm throttles it by 70%. Second: outbound links in posts will immediately penalize your reach by half. Always put links in the comments. Third: PDF carousels perform 3.4x better than text-only updates.

[CTA]
Follow for daily LinkedIn algorithm breakdowns. I read the patents so you don't have to.`,
    hooks: [
      { id: "h4_1", text: "8 secrets about the LinkedIn algorithm they won't tell you.", variant: "a", score: 83, is_top: true },
      { id: "h4_2", text: "The LinkedIn cheat sheet they tried to bury.", variant: "b", score: 79 }
    ],
    captions: {
      tiktok: "",
      instagram: "",
      youtube: "",
      twitter: "",
      linkedin: "The LinkedIn algorithm secrets no one is talking about. We analyzed 1,000 posts to see what triggers the distribution engine. Outbound links, PDF metrics, comment velocity, and dwell time. Here is the full guide: 👇"
    },
    hashtags: {
      tiktok: [],
      instagram: [],
      youtube: [],
      twitter: [],
      linkedin: ["linkedin", "marketing", "algorithms"]
    },
    thumbnail_brief: {
      concept: "A diagram showing the LinkedIn feed with highlighted technical algorithms symbols, clean look.",
      textOverlay: {
        large: "LINKEDIN SECRETS",
        small: "1,000 Post Study"
      },
      expression: "Clean corporate tech aesthetics",
      colors: ["#1E2A7A", "#1A1A18", "#EFE9DF"],
      referenceStyle: "Sleek infographics look"
    },
    schedule: {
      tiktok: "",
      instagram: "",
      youtube: "",
      twitter: "",
      linkedin: "Approved - Ready to post"
    }
  }
];

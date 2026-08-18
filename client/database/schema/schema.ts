import {
    pgTable,
    text,
    timestamp,
    uuid,
    real,
    jsonb,
    integer,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
    "users",
    {
        id: text("id").primaryKey(),

        email: text("email").notNull().unique(),

        fullName: text("full_name"),

        tier: text("tier", {
            enum: ["free", "premium", "enterprise"],
        })
            .default("free")
            .notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => [
        uniqueIndex("user_email_id").on(t.email),
        index("user_created_id").on(t.createdAt),
        index("user_tier_id").on(t.tier),
    ]
);



export const creatorProfiles = pgTable(
    "creator_profiles",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        niche: text("niche").notNull(),
        targetAudience: text("target_audience").notNull(),
        preferredLanguage: text("preferred_language")
            .default("hinglish")
            .notNull(),
        primaryPlatform: text("primary_platform")
            .default("Youtube Shorts")
            .notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        index("creator_profiles_user_idx").on(table.userId),
        index("creator_profiles_niche_idx").on(table.niche),
        index("creator_profiles_platform_idx").on(
            table.primaryPlatform
        ),
    ]
);



export const scripts = pgTable(
    "scripts",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        creatorId: text("creator_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        topic: text("topic").notNull(),

        topicDetails: text("topic_details"),

        status: text("status", {
            enum: [
                "drafting",
                "paused_at_review",
                "completed",
            ],
        })
            .default("drafting")
            .notNull(),

        viralityScore: real("virality_score").default(0),

        scoreReasoning: text("score_reasoning"),

        totalRevisionCycles: integer("total_revision_cycles")
            .default(0)
            .notNull(),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("scripts_creator_idx").on(table.creatorId),

        index("scripts_status_idx").on(table.status),

        index("scripts_created_idx").on(table.createdAt),

        index("scripts_virality_idx").on(
            table.viralityScore
        ),

        index("scripts_creator_virality_idx").on(
            table.creatorId,
            table.viralityScore
        ),
    ]
);


export const productionAssets = pgTable(
    "production_assets",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        scriptId: uuid("script_id")
            .notNull()
            .references(() => scripts.id, {
                onDelete: "cascade",
            }),

        finalScriptText: text("final_script_text").notNull(),

        titleVariants: jsonb("title_variants")
            .$type<string[]>()
            .notNull(),

        abSplitHooks: jsonb("ab_split_hooks")
            .$type<[string, string]>()
            .notNull(),

        linkedinPost: text("linkedin_post").notNull(),

        twitterThread: jsonb("twitter_thread")
            .$type<
                {
                    id: number;
                    text: string;
                }[]
            >()
            .notNull(),

        seoMetadata: jsonb("seo_metadata")
            .$type<{
                description: string;
                primaryKeywords: string[];
                tags: string[];
            }>()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .notNull(),
    },
    (table) => [
        uniqueIndex("production_script_idx").on(
            table.scriptId
        ),

        index("production_updated_idx").on(
            table.updatedAt
        ),
    ]
);

export const chatMemory = pgTable("chat_memory", {
    thread_id: text("thread_id").primaryKey(),

    creator_id: text("creator_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    summary: text("summary").default(""),

    recent_messages: jsonb("recent_messages").default([]).$type<unknown[]>(),

    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),

    total_message_count: integer("total_message_count").notNull().default(0),

    next_summary_threshold: integer("next_summary_threshold").notNull().default(20),
})

export type ChatMemoryRow = typeof chatMemory.$inferSelect
export type NewChatMemoryRow = typeof chatMemory.$inferInsert
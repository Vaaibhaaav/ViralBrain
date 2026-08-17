CREATE TABLE "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"niche" text NOT NULL,
	"target_audience" text NOT NULL,
	"preferred_language" text DEFAULT 'hinglish' NOT NULL,
	"primary_platform" text DEFAULT 'Youtube Shorts' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"script_id" uuid NOT NULL,
	"final_script_text" text NOT NULL,
	"title_variants" jsonb NOT NULL,
	"ab_split_hooks" jsonb NOT NULL,
	"linkedin_post" text NOT NULL,
	"twitter_thread" jsonb NOT NULL,
	"seo_metadata" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"creator_id" text NOT NULL,
	"topic" text NOT NULL,
	"topic_details" text,
	"status" text DEFAULT 'drafting' NOT NULL,
	"virality_score" real DEFAULT 0,
	"score_reasoning" text,
	"total_revision_cycles" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"full_name" text,
	"tier" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "production_assets" ADD CONSTRAINT "production_assets_script_id_scripts_id_fkey" FOREIGN KEY ("script_id") REFERENCES "scripts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE;
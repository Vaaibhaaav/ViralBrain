CREATE INDEX "creator_profiles_user_idx" ON "creator_profiles" ("user_id");--> statement-breakpoint
CREATE INDEX "creator_profiles_niche_idx" ON "creator_profiles" ("niche");--> statement-breakpoint
CREATE INDEX "creator_profiles_platform_idx" ON "creator_profiles" ("primary_platform");--> statement-breakpoint
CREATE UNIQUE INDEX "production_script_idx" ON "production_assets" ("script_id");--> statement-breakpoint
CREATE INDEX "production_updated_idx" ON "production_assets" ("updated_at");--> statement-breakpoint
CREATE INDEX "scripts_creator_idx" ON "scripts" ("creator_id");--> statement-breakpoint
CREATE INDEX "scripts_status_idx" ON "scripts" ("status");--> statement-breakpoint
CREATE INDEX "scripts_created_idx" ON "scripts" ("created_at");--> statement-breakpoint
CREATE INDEX "scripts_virality_idx" ON "scripts" ("virality_score");--> statement-breakpoint
CREATE INDEX "scripts_creator_virality_idx" ON "scripts" ("creator_id","virality_score");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_id" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "user_created_id" ON "users" ("created_at");--> statement-breakpoint
CREATE INDEX "user_tier_id" ON "users" ("tier");
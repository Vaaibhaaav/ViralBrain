CREATE TABLE "chat_memory" (
	"thread_id" text PRIMARY KEY,
	"creator_id" text NOT NULL,
	"summary" text DEFAULT '',
	"recent_messages" jsonb DEFAULT '[]',
	"updated_at" timestamp with time zone DEFAULT now(),
	"total_message_count" integer DEFAULT 0 NOT NULL,
	"next_summary_threshold" integer DEFAULT 20 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_memory" ADD CONSTRAINT "chat_memory_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE;
import "server-only"
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
console.log("[NEON DATABASE URL]", databaseUrl);

if (!databaseUrl) {
  throw new Error("💥 DATABASE_URL is missing from your environmental secret configuration.");
}

const sql = neon(databaseUrl);
export const db = drizzle({ client: sql });
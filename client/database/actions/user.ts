"use server"

import { db } from "./db";
import { users, creatorProfiles } from "../schema/schema";
import { eq } from "drizzle-orm";

export interface UserProfileRequest {
    niche: string;
    targetAudience: string;
    preferredLanguage: string;
    primaryPlatform: string;
}

export interface ClerkUserWebhookRequest {
    clerk_id: string;
    full_name: string;
    email: string;
    tier: "free" | "premium" | "enterprise";
}


export async function fetchUserProfile(user_id: string) {
    try {
        const rows = await db
            .select(
                {
                    id: users.id,
                    email: users.email,
                    fullName: users.fullName,
                    tier: users.tier || "free",
                    creator_profile_id: creatorProfiles.id,
                    niche: creatorProfiles.niche,
                    targetAudience: creatorProfiles.targetAudience,
                    preferredLanguage: creatorProfiles.preferredLanguage,
                    primaryPlatform: creatorProfiles.primaryPlatform
                }
            )
            .from(users)
            .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
            .where(eq(users.id, user_id))
            .limit(1);
        if (!rows || rows.length === 0) {
            throw new Error(`No user found for provided ID: ${user_id}`);
        }

        return rows[0];
    } catch (error) {
        console.error(`[DB ERROR] fetchUserProfile failed for ID ${user_id}:`, error);
        throw error;
    }
}


export async function createCreatorProfile(user_id: string, request: UserProfileRequest) {
    try {
        const [upsertedProfile] = await db
            .insert(creatorProfiles)
            .values({
                userId: user_id,
                niche: request.niche,
                targetAudience: request.targetAudience,
                preferredLanguage: request.preferredLanguage,
                primaryPlatform: request.primaryPlatform,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [creatorProfiles.userId],
                set: {
                    niche: request.niche,
                    targetAudience: request.targetAudience,
                    preferredLanguage: request.preferredLanguage,
                    primaryPlatform: request.primaryPlatform,
                    updatedAt: new Date(),
                },
            })
            .returning();
        return { success: true, data: upsertedProfile };
    } catch (error) {
        console.error(`[DB ERROR] createCreatorProfile failed for user ${user_id}:`, error);
        throw error;
    }
}

export async function createUserWebhook(request: ClerkUserWebhookRequest) {
    try {
        const [upsertedUser] = await db
            .insert(users)
            .values({
                id: request.clerk_id,
                email: request.email,
                fullName: request.full_name,
                tier: request.tier,
            })
            .onConflictDoUpdate({
                target: [users.id],
                set: {
                    email: request.email,
                    fullName: request.full_name,
                    tier: request.tier,
                },
            })
            .returning();

        return { success: true, data: upsertedUser };
    } catch (error) {
        console.error(`[DB ERROR] createUserWebhook failed for Clerk ID ${request.clerk_id}:`, error);
        throw error;
    }
}
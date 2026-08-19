import { eq } from "drizzle-orm";
import { db } from "../actions/db";
import { CreatorProfileRow, creatorProfiles } from "../schema/schema";

type ProfileUpdateInput = Partial<Omit<CreatorProfileRow, "id" | "userId" | "updatedAt">>;

type ProfileCreateInput = Omit<CreatorProfileRow, "id" | "userId" | "updatedAt">;

export async function getProfile(userId: string) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const [profile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, userId));

    return profile ?? null;
}

export async function updateProfile(userId: string, profileData: ProfileUpdateInput) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const [updated] = await db
        .update(creatorProfiles)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(creatorProfiles.userId, userId))
        .returning();

    return updated ?? null;
}

export async function upsertProfile(userId: string, profileData: ProfileCreateInput) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const [profile] = await db
        .insert(creatorProfiles)
        .values({ userId, ...profileData })
        .onConflictDoUpdate({
            target: creatorProfiles.userId,
            set: { ...profileData, updatedAt: new Date() },
        })
        .returning();

    return profile;
}
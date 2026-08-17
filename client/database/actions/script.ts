"use server"

import { desc, eq } from "drizzle-orm"
import { productionAssets, scripts } from "../schema/schema"
import { db } from "./db"

interface ScriptRequest {
    topic: string
    topicDetails: string
    status: 'drafting' | 'paused_at_review' | 'completed'
    viralityScore: number
    scoreReasoning: string
    totalRevisionCycles: number
    finalScriptText: string
    titleVariants: string[]
    abSplitHooks: [string, string]
    linkedinPost: string
    twitterThread: { id: number; text: string }[]
    seoMetadata: {
        description: string
        primaryKeywords: string[]
        tags: string[]
    }
}

export async function fetchPreviousScripts(userId: string, limit: number = 5) {
    try {
        const previousScripts = await db
            .select()
            .from(scripts)
            .innerJoin(productionAssets, eq(scripts.id, productionAssets.scriptId))
            .where(eq(scripts.creatorId, userId))
            .orderBy(desc(scripts.createdAt))
            .limit(limit)

        if (previousScripts.length === 0) {
            return []
        }

        return previousScripts
    } catch (error) {
        console.error("[API ERROR] Error while fetching scripts for:", userId, error)
        throw error
    }
}

export async function createScript(
    request: ScriptRequest,
    creatorId: string,
    status: "drafting" | "paused_at_review" | "completed" = "completed"
) {
    try {
        const [insertedScript] = await db
            .insert(scripts)
            .values({
                creatorId,
                topic: request.topic,
                topicDetails: request.topicDetails,
                status: status,
                viralityScore: request.viralityScore,
                scoreReasoning: request.scoreReasoning,
                totalRevisionCycles: request.totalRevisionCycles,
            })
            .returning();

        const [insertedProductionAssets] = await db
            .insert(productionAssets)
            .values({
                scriptId: insertedScript.id,
                finalScriptText: request.finalScriptText,
                titleVariants: request.titleVariants,
                abSplitHooks: request.abSplitHooks,
                linkedinPost: request.linkedinPost,
                twitterThread: request.twitterThread,
                seoMetadata: request.seoMetadata,
            })
            .returning();

        return {
            insertedScript,
            insertedProductionAssets,
        };
    } catch (error) {
        console.error("[API ERROR] Error while creating script.", error)
        throw error
    }
}
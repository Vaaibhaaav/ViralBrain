"use server"

import { and, eq, desc } from "drizzle-orm"
import { db } from "../actions/db"
import { chatMemory, type ChatMemoryRow } from "../schema/schema"

export interface ChatThreadSummary {
    thread_id: string;
    summary: string;
    updated_at: string | null;
    total_message_count: number;
}

export async function fetchPreviousChatsByThreadId(
    thread_id: string,
    creator_id: string
): Promise<ChatMemoryRow | null> {
    if (!thread_id || !creator_id) {
        throw new Error("fetchPreviousChatsByThreadId requires both thread_id and creator_id")
    }

    try {
        const rows = await db
            .select()
            .from(chatMemory)
            .where(and(eq(chatMemory.thread_id, thread_id), eq(chatMemory.creator_id, creator_id)))
            .limit(1)

        return rows[0] ?? null
    } catch (error) {
        console.error(
            `[DB ERROR] fetchPreviousChatsByThreadId failed for Thread ID ${thread_id}, Creator ${creator_id}:`,
            error
        )
        throw error
    }
}

export async function previousThreads(creator_id: string): Promise<string[]> {
    if (!creator_id) {
        throw new Error("previousThreads requires a creator_id")
    }

    try {
        const rows = await db
            .select({ thread_id: chatMemory.thread_id })
            .from(chatMemory)
            .where(eq(chatMemory.creator_id, creator_id))

        return rows.map((r) => r.thread_id)
    } catch (error) {
        console.error(`[DB ERROR] previousThreads failed for Creator ${creator_id}:`, error)
        throw error
    }
}

export async function fetchPreviousThreadsSummary(
    creator_id: string
): Promise<ChatThreadSummary[]> {
    if (!creator_id) return []

    try {
        const rows = await db
            .select({
                thread_id: chatMemory.thread_id,
                summary: chatMemory.summary,
                updated_at: chatMemory.updated_at,
                total_message_count: chatMemory.total_message_count,
            })
            .from(chatMemory)
            .where(eq(chatMemory.creator_id, creator_id))
            .orderBy(desc(chatMemory.updated_at))
            .limit(30)

        return rows.map((r) => ({
            thread_id: r.thread_id,
            summary: r.summary || "Conversation Session",
            updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : null,
            total_message_count: r.total_message_count || 0,
        }))
    } catch (error) {
        console.error(`[DB ERROR] fetchPreviousThreadsSummary failed for Creator ${creator_id}:`, error)
        return []
    }
}

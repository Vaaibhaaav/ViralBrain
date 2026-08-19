import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { User, Platform } from "./types"
import { createCreatorProfile } from "@/database/actions/user"

interface UserStore {
    user: (User & {
        packs_created?: number;
        voice_vectors?: number;
        approval_rate?: number;
        connected_platforms?: Platform[];
    }) | null,
    setUser: (user: any) => void,
    removeUser: () => void,
    updateCreatorProfile: (profile: {
        niche: string;
        targetAudience: string;
        preferredLanguage: string;
        primaryPlatform: string;
    }) => Promise<void>;
}

export const useUserStore = create<UserStore>()(persist(
    (set, get) => ({
        user: null,
        setUser: (user) => set({
            user: {
                ...user,
                // fallback defaults matching MOCK_USER style
                packs_created: user?.packs_created ?? 0,
                voice_vectors: user?.voice_vectors ?? 3840,
                approval_rate: user?.approval_rate ?? 100,
                connected_platforms: user?.connected_platforms ?? ["youtube", "tiktok", "instagram", "twitter", "linkedin"]
            }
        }),
        removeUser: () => set({ user: null }),
        updateCreatorProfile: async (profileData) => {
            const currentUser = get().user;
            if (!currentUser || !currentUser.id) return;

            try {
                const res = await createCreatorProfile(currentUser.id, profileData);
                if (res.success && res.data) {
                    set({
                        user: {
                            ...currentUser,
                            creator_profile_id: res.data.id,
                            niche: res.data.niche,
                            targetAudience: res.data.targetAudience,
                            preferredLanguage: res.data.preferredLanguage,
                            primaryPlatform: res.data.primaryPlatform,
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to update creator profile in DB:", error);
                throw error;
            }
        }
    }),
    {
        name: "viralbrain-user-storage",
        partialize: (state) => ({
            user: state.user
        }),
    }
))


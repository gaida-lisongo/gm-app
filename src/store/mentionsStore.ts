import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MentionWithSections {
  id: number;
  designation: string;
  id_agent: number;
  date_creation: string;
  description: string;
  sections: Array<{
    id: number;
    designation: string;
    id_chef: number;
    id_sec: number;
    id_mention: number;
    description: string;
    chef_section: string;
    sec_section: string;
  }>;
}

interface MentionsState {
  mentions: MentionWithSections[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  fetchMentions: () => Promise<void>;
  clearError: () => void;
}

export const useMentionsStore = create<MentionsState>()(
  persist(
    (set, get) => ({
      mentions: [],
      isLoading: false,
      error: null,
      lastFetch: null,

      fetchMentions: async () => {
        const { lastFetch } = get();
        const now = Date.now();
        
        // Cache for 5 minutes (300000ms)
        if (lastFetch && now - lastFetch < 300000) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/mentions');
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          set({ 
            mentions: data, 
            isLoading: false, 
            error: null,
            lastFetch: now
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'mentions-storage',
      partialize: (state) => ({ 
        mentions: state.mentions,
        lastFetch: state.lastFetch
      }),
    }
  )
);

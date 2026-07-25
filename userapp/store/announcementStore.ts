import { create } from 'zustand';
import { Announcement } from '@/types/academy';
import { academyApiService } from '@/services/academyManagement/academy';

interface AnnouncementState {
  posts: Announcement[];
  isLoading: boolean;
  error: string | null;
  fetchAnnouncementsForAcademy: (academyId: string) => Promise<void>;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchAnnouncementsForAcademy: async (academyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getAnnouncements(academyId);
      set({ posts: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load announcements', isLoading: false });
    }
  },
}));

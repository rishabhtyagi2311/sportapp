import { create } from 'zustand';
import { academyApiService } from '@/services/academyManagement/academy';

export interface Announcement {
  id: string;
  academyId: string;
  content: string;
  createdAt: string; // ISO string
}

interface AnnouncementState {
  posts: Announcement[];
  isLoading: boolean;
  error: string | null;
  fetchAnnouncements: (academyId: string) => Promise<void>;
  addPost: (academyId: string, content: string) => Promise<void>;
  removePost: (academyId: string, announcementId: string) => Promise<void>;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchAnnouncements: async (academyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getAnnouncements(academyId);
      if (response.success) {
        set({ posts: response.data });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load announcements' });
    } finally {
      set({ isLoading: false });
    }
  },

  addPost: async (academyId, content) => {
    const response = await academyApiService.createAnnouncement(academyId, content);
    if (!response.success) {
      throw new Error(response.message || 'Could not post announcement');
    }
    set((state) => ({ posts: [response.data, ...state.posts] }));
  },

  removePost: async (academyId, announcementId) => {
    const response = await academyApiService.removeAnnouncement(academyId, announcementId);
    if (!response.success) {
      throw new Error(response.message || 'Could not remove announcement');
    }
    set((state) => ({ posts: state.posts.filter((p) => p.id !== announcementId) }));
  },
}));

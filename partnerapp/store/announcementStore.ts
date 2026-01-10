import { create } from 'zustand';

export interface Announcement {
  id: string;
  content: string;
  createdAt: string; // ISO string for easy sorting/formatting
}

interface AnnouncementState {
  posts: Announcement[];
  addPost: (content: string) => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  posts: [
    {
      id: '1',
      content: '📢 Important: Due to heavy rains, the evening football batch (5 PM - 7 PM) is cancelled today. Please stay safe!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: '2',
      content: '🗓️ Schedule Update: Starting next Monday, the Morning Fitness batch will begin at 6:30 AM instead of 6:00 AM.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    },
    {
      id: '3',
      content: '🎉 Reminder: The inter-academy tournament registration closes this Sunday. Make sure to submit your forms.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    },
  ],
  addPost: (content) =>
    set((state) => ({
      posts: [
        {
          id: Math.random().toString(36).substr(2, 9),
          content,
          createdAt: new Date().toISOString(),
        },
        ...state.posts, // Add new post to the TOP of the list
      ],
    })),
}));
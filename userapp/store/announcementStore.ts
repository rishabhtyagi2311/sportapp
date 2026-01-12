import { create } from 'zustand';

// 1. Define Interfaces
export interface Announcement {
  id: string;
  content: string;
  createdAt: string;
}

interface AnnouncementState {
  posts: Announcement[];
  isDummyData: boolean; // Flag to track if we are still showing dummy content
  addPost: (content: string) => void;
}

// 2. Define Dummy Data Constant
const DUMMY_POSTS: Announcement[] = [
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
];

// 3. Create the Store
export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  // Initialize with dummy posts and the flag set to true
  posts: DUMMY_POSTS,
  isDummyData: true,

  addPost: (content) =>
    set((state) => {
      const newPost: Announcement = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        createdAt: new Date().toISOString(),
      };

      // LOGIC: If we are currently showing dummy data, replace it entirely with the new post.
      // Otherwise, add the new post to the top of the existing list.
      if (state.isDummyData) {
        return {
          posts: [newPost], // Start fresh with the user's first post
          isDummyData: false, // Turn off dummy mode
        };
      }

      return {
        posts: [newPost, ...state.posts],
      };
    }),
}));
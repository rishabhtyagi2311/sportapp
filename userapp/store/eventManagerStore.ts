import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Event } from '@/types/booking';
import { useBookingStore } from '@/store/venueStore';

interface EventManagerState {
  managedEvents: Event[];
  isLoading: boolean;
  error: string | null;

  // Core actions
  createEvent: (event: Event) => void;
  updateEvent: (eventId: string, update: Partial<Event>) => void;
  completeEvent: (eventId: string) => void;
  deleteEvent: (eventId: string) => void;

  // Queries
  getEventsByManager: (managerId: string) => Event[];
  getUpcomingEvents: (managerId: string) => Event[];
  getCompletedEvents: (managerId: string) => Event[];
}

export const useEventManagerStore = create<EventManagerState>()(
  devtools(
    immer((set, get) => ({
      managedEvents: [],
      isLoading: false,
      error: null,

      /* ---------------- CREATE ---------------- */
      createEvent: (event) =>
        set((state) => {
          // 1. Update Manager Store
          state.managedEvents.push(event);

          // 2. Sync Booking Store (Public View)
          // We access the store directly to trigger the update
          useBookingStore.getState().addEvent(event);
        }),

      /* ---------------- UPDATE ---------------- */
      updateEvent: (eventId, update) =>
        set((state) => {
          const idx = state.managedEvents.findIndex((e) => e.id === eventId);
          if (idx === -1) return;

          // Generate one timestamp so both stores match exactly
          const timestamp = new Date().toISOString();
          const finalUpdate = { ...update, updatedAt: timestamp };

          // 1. Update Manager Store
          state.managedEvents[idx] = {
            ...state.managedEvents[idx],
            ...finalUpdate,
          };

          // 2. Sync Booking Store
          useBookingStore.getState().updateEvent(eventId, finalUpdate);
        }),

      /* ---------------- COMPLETE ---------------- */
      completeEvent: (eventId) => {
        // We reuse updateEvent to ensure sync logic happens automatically
        get().updateEvent(eventId, { status: 'completed' });
      },

      /* ---------------- DELETE ---------------- */
      deleteEvent: (eventId) =>
        set((state) => {
          // 1. Update Manager Store
          state.managedEvents = state.managedEvents.filter(
            (e) => e.id !== eventId
          );

          // 2. Sync Booking Store
          useBookingStore.getState().deleteEvent(eventId);
        }),

      /* ---------------- QUERIES ---------------- */
      getEventsByManager: (managerId) =>
        get().managedEvents.filter((e) => e.creatorId === managerId),

      getUpcomingEvents: (managerId) =>
        get().managedEvents.filter(
          (e) => e.creatorId === managerId && e.status === 'upcoming'
        ),

      getCompletedEvents: (managerId) =>
        get().managedEvents.filter(
          (e) => e.creatorId === managerId && e.status === 'completed'
        ),
    })),
    { name: 'event-manager-store' }
  )
);
// stores/eventManagerStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Event } from '@/types/booking'
import { useBookingStore } from '@/store/venueStore'

interface EventManagerState {
  managedEvents: Event[]
  isLoading: boolean
  error: string | null

  // Core actions
  createEvent: (event: Event) => void
  updateEvent: (eventId: string, update: Partial<Event>) => void
  completeEvent: (eventId: string) => void
  deleteEvent: (eventId: string) => void

  // Queries
  getEventsByManager: (managerId: string) => Event[]
  getUpcomingEvents: (managerId: string) => Event[]
  getCompletedEvents: (managerId: string) => Event[]
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
          state.managedEvents.push(event)

          // 🔁 Sync PUBLIC snapshot
          useBookingStore.getState().addEvent(event)
        }),

      /* ---------------- UPDATE ---------------- */
      updateEvent: (eventId, update) =>
        set((state) => {
          const idx = state.managedEvents.findIndex(e => e.id === eventId)
          if (idx === -1) return

          state.managedEvents[idx] = {
            ...state.managedEvents[idx],
            ...update,
            updatedAt: new Date().toISOString(),
          }

          // 🔁 Sync PUBLIC snapshot
          useBookingStore
            .getState()
            .updateEvent(eventId, update)
        }),

      /* ---------------- COMPLETE ---------------- */
      completeEvent: (eventId) =>
        set((state) => {
          const event = state.managedEvents.find(e => e.id === eventId)
          if (!event) return

          event.status = 'completed'
          event.updatedAt = new Date().toISOString()

          // 🔁 Sync PUBLIC snapshot
          useBookingStore
            .getState()
            .updateEvent(eventId, { status: 'completed' })
        }),

      /* ---------------- DELETE ---------------- */
      deleteEvent: (eventId) =>
        set((state) => {
          state.managedEvents = state.managedEvents.filter(e => e.id !== eventId)

          // 🔁 Remove from public store
          useBookingStore.getState().deleteEvent(eventId)
        }),

      /* ---------------- QUERIES ---------------- */
      getEventsByManager: (managerId) =>
        get().managedEvents.filter(e => e.creatorId === managerId),

      getUpcomingEvents: (managerId) =>
        get().managedEvents.filter(
          e => e.creatorId === managerId && e.status === 'upcoming'
        ),

      getCompletedEvents: (managerId) =>
        get().managedEvents.filter(
          e => e.creatorId === managerId && e.status === 'completed'
        ),
    })),
    { name: 'event-manager-store' }
  )
)

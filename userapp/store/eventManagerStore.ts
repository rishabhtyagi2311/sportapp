import { create } from 'zustand';
import { EventItem } from '@/types/event';
import { eventApiService } from '@/services/eventManagement/event';

interface EventManagerState {
  events: EventItem[];
  myEvents: EventItem[];
  isLoading: boolean;
  error: string | null;

  fetchPublicEvents: (filters?: { sportName?: string; city?: string; eventType?: string; status?: string }) => Promise<void>;
  fetchMyEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<EventItem | null>;
  createEvent: (input: Record<string, any>) => Promise<EventItem>;
  updateEvent: (id: string, input: Record<string, any>) => Promise<EventItem>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => EventItem | undefined;
}

export const useEventManagerStore = create<EventManagerState>((set, get) => ({
  events: [],
  myEvents: [],
  isLoading: false,
  error: null,

  fetchPublicEvents: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventApiService.getEvents(filters);
      set({ events: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load events', isLoading: false });
    }
  },

  fetchMyEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventApiService.getMyEvents();
      set({ myEvents: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load your events', isLoading: false });
    }
  },

  fetchEventById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventApiService.getEventById(id);
      set((state) => {
        const merge = (list: EventItem[]) => {
          const idx = list.findIndex((e) => e.id === id);
          if (idx === -1) return [...list, response.data];
          const copy = [...list];
          copy[idx] = response.data;
          return copy;
        };
        return { events: merge(state.events), myEvents: merge(state.myEvents), isLoading: false };
      });
      return response.data;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load event', isLoading: false });
      return null;
    }
  },

  createEvent: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventApiService.createEvent(input);
      set((state) => ({ myEvents: [response.data, ...state.myEvents], isLoading: false }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not create event';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateEvent: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventApiService.updateEvent(id, input);
      set((state) => ({
        myEvents: state.myEvents.map((e) => (e.id === id ? response.data : e)),
        events: state.events.map((e) => (e.id === id ? response.data : e)),
        isLoading: false,
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not update event';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await eventApiService.deleteEvent(id);
      set((state) => ({
        myEvents: state.myEvents.filter((e) => e.id !== id),
        events: state.events.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not delete event';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  getEventById: (id) => get().events.find((e) => e.id === id) || get().myEvents.find((e) => e.id === id),
}));

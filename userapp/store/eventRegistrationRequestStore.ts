// store/eventRegistrationRequestStore.ts
import { create } from 'zustand';
import { EventRegistration } from '@/types/event';
import { eventApiService } from '@/services/eventManagement/event';

interface EventRegistrationState {
  registrationsByEvent: Record<string, EventRegistration[]>;
  myRegistrations: EventRegistration[];
  isLoading: boolean;
  error: string | null;

  fetchRegistrationsForEvent: (eventId: string) => Promise<void>;
  fetchMyRegistrations: () => Promise<void>;
  createRegistration: (
    eventId: string,
    input: { participationType: 'individual' | 'team'; footballTeamId?: number }
  ) => Promise<EventRegistration>;
  processRegistration: (
    eventId: string,
    registrationId: string,
    input: { status: 'accepted' | 'rejected'; notes?: string }
  ) => Promise<void>;
  getRegistrationsByEvent: (eventId: string) => EventRegistration[];
  getEventStats: (eventId: string) => { pending: number; accepted: number; rejected: number; total: number };
}

export const useRegistrationRequestStore = create<EventRegistrationState>((set, get) => ({
  registrationsByEvent: {},
  myRegistrations: [],
  isLoading: false,
  error: null,

  fetchRegistrationsForEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventApiService.getRegistrationsForEvent(eventId);
      set((state) => ({
        registrationsByEvent: { ...state.registrationsByEvent, [eventId]: response.data },
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load registrations', isLoading: false });
    }
  },

  fetchMyRegistrations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventApiService.getMyRegistrations();
      set({ myRegistrations: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load your registrations', isLoading: false });
    }
  },

  createRegistration: async (eventId, input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventApiService.createRegistration(eventId, input);
      set((state) => ({ myRegistrations: [response.data, ...state.myRegistrations], isLoading: false }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not submit registration';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  processRegistration: async (eventId, registrationId, input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventApiService.processRegistration(eventId, registrationId, input);
      set((state) => ({
        registrationsByEvent: {
          ...state.registrationsByEvent,
          [eventId]: (state.registrationsByEvent[eventId] || []).map((r) =>
            r.id === registrationId ? response.data : r
          ),
        },
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not process registration';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  getRegistrationsByEvent: (eventId) => get().registrationsByEvent[eventId] || [],

  getEventStats: (eventId) => {
    const requests = get().registrationsByEvent[eventId] || [];
    return {
      pending: requests.filter((r) => r.status === 'pending').length,
      accepted: requests.filter((r) => r.status === 'accepted').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      total: requests.length,
    };
  },
}));

// stores/registrationRequestStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type RequestStatus = 'pending' | 'accepted' | 'rejected';
export type ParticipationType = 'individual' | 'team';

export interface IndividualRequest {
  id: string;
  eventId: string;
  userId: string;
  participantName: string;
  contact: string;
  email: string;
  participationType: 'individual';
  status: RequestStatus;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string; // Manager ID
  notes?: string;
}

export interface TeamRequest {
  id: string;
  eventId: string;
  userId: string;
  teamName: string;
  captainName?: string;
  captainContact: string;
  captainEmail: string;
  teamMembers: {
    id: string;
    name: string;
    contact: string;
  }[];
  participationType: 'team';
  teamSize: number;
  status: RequestStatus;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string; // Manager ID
  notes?: string;
}

export type RegistrationRequest = IndividualRequest | TeamRequest;

export interface RegistrationRequestState {
  requests: RegistrationRequest[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addRequest: (request: RegistrationRequest) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, managerId: string, notes?: string) => void;
  getRequestsByEvent: (eventId: string) => RegistrationRequest[];
  getRequestById: (requestId: string) => RegistrationRequest | undefined;
  getRequestsByUser: (userId: string) => RegistrationRequest[];
  getRequestsByStatus: (eventId: string, status: RequestStatus) => RegistrationRequest[];
  getEventStats: (eventId: string) => {
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  };
  deleteRequest: (requestId: string) => void;
  setRequests: (requests: RegistrationRequest[]) => void;
}

export const useRegistrationRequestStore = create<RegistrationRequestState>()(
  devtools(
    immer((set, get) => ({
      requests: [],
      isLoading: false,
      error: null,

      addRequest: (request: RegistrationRequest) =>
        set((state) => {
          state.requests.push(request);
          state.error = null;
        }),

      updateRequestStatus: (requestId: string, status: RequestStatus, managerId: string, notes?: string) =>
        set((state) => {
          const index = state.requests.findIndex((r) => r.id === requestId);
          if (index !== -1) {
            state.requests[index].status = status;
            state.requests[index].processedAt = new Date().toISOString();
            state.requests[index].processedBy = managerId;
            if (notes) {
              state.requests[index].notes = notes;
            }
          }
        }),

      getRequestsByEvent: (eventId: string) => {
        return get().requests.filter((r) => r.eventId === eventId);
      },

      getRequestById: (requestId: string) => {
        return get().requests.find((r) => r.id === requestId);
      },

      getRequestsByUser: (userId: string) => {
        return get().requests.filter((r) => r.userId === userId);
      },

      getRequestsByStatus: (eventId: string, status: RequestStatus) => {
        return get().requests.filter((r) => r.eventId === eventId && r.status === status);
      },

      getEventStats: (eventId: string) => {
        const eventRequests = get().requests.filter((r) => r.eventId === eventId);
        return {
          pending: eventRequests.filter((r) => r.status === 'pending').length,
          accepted: eventRequests.filter((r) => r.status === 'accepted').length,
          rejected: eventRequests.filter((r) => r.status === 'rejected').length,
          total: eventRequests.length,
        };
      },

      deleteRequest: (requestId: string) =>
        set((state) => {
          state.requests = state.requests.filter((r) => r.id !== requestId);
        }),

      setRequests: (requests: RegistrationRequest[]) =>
        set((state) => {
          state.requests = requests;
          state.isLoading = false;
          state.error = null;
        }),
    })),
    {
      name: 'registration-request-store',
    }
  )
);
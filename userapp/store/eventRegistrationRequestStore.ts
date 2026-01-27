// stores/eventRegistrationRequestStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/* -------------------------------------------------------------------------- */
/* ENUMS & COMMON TYPES */
/* -------------------------------------------------------------------------- */

export type RequestStatus = 'pending' | 'accepted' | 'rejected';
export type ParticipationType = 'individual' | 'team';

export type RegistrationDomain =
  | 'regular'
  | 'football_tournament';

/* -------------------------------------------------------------------------- */
/* REGULAR EVENT REQUESTS */
/* -------------------------------------------------------------------------- */

export interface RegularIndividualRequest {
  id: string;
  domain: 'regular';

  eventId: string;
  userId: string;

  participationType: 'individual';
  participantName: string;
  contact: string;
  email: string;

  status: RequestStatus;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string; // manager / organizer id
  notes?: string;
}

export interface RegularTeamRequest {
  id: string;
  domain: 'regular';

  eventId: string;
  userId: string;

  participationType: 'team';
  teamName: string;
  captainName?: string;
  captainContact: string;
  captainEmail: string;

  teamMembers: {
    id: string;
    name: string;
    contact: string;
  }[];

  teamSize: number;

  status: RequestStatus;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/* FOOTBALL TOURNAMENT REQUEST */
/* -------------------------------------------------------------------------- */

export interface FootballTournamentRequest {
  id: string;
  domain: 'football_tournament';

  eventId: string;

  teamId: string;
  teamName: string;

  captainPlayerId: string;
  captainName: string;

  status: RequestStatus;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/* UNION TYPE */
/* -------------------------------------------------------------------------- */

export type RegistrationRequest =
  | RegularIndividualRequest
  | RegularTeamRequest
  | FootballTournamentRequest;

/* -------------------------------------------------------------------------- */
/* STORE STATE */
/* -------------------------------------------------------------------------- */

export interface RegistrationRequestState {
  requests: RegistrationRequest[];
  isLoading: boolean;
  error: string | null;

  /* ------------------ ACTIONS ------------------ */

  addRequest: (request: RegistrationRequest) => void;

  updateRequestStatus: (
    requestId: string,
    status: RequestStatus,
    managerId: string,
    notes?: string
  ) => void;

  deleteRequest: (requestId: string) => void;

  deleteRequestsByEvent: (eventId: string) => void;

  setRequests: (requests: RegistrationRequest[]) => void;

  /* ------------------ GETTERS ------------------ */

  getRequestsByEvent: (eventId: string) => RegistrationRequest[];

  getRequestById: (requestId: string) => RegistrationRequest | undefined;

  getRequestsByUser: (userId: string) => RegistrationRequest[];

  getRequestsByDomain: (
    eventId: string,
    domain: RegistrationDomain
  ) => RegistrationRequest[];

  getRequestsByStatus: (
    eventId: string,
    status: RequestStatus
  ) => RegistrationRequest[];

  getEventStats: (eventId: string) => {
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  };
}

/* -------------------------------------------------------------------------- */
/* STORE IMPLEMENTATION */
/* -------------------------------------------------------------------------- */

export const useRegistrationRequestStore =
  create<RegistrationRequestState>()(
    devtools(
      immer((set, get) => ({
        requests: [],
        isLoading: false,
        error: null,

        /* ------------------ ACTIONS ------------------ */

        addRequest: (request) =>
          set((state) => {
            state.requests.push(request);
            state.error = null;
          }),

        updateRequestStatus: (
          requestId,
          status,
          managerId,
          notes
        ) =>
          set((state) => {
            const req = state.requests.find(
              (r) => r.id === requestId
            );

            if (!req) return;

            req.status = status;
            req.processedAt = new Date().toISOString();
            req.processedBy = managerId;

            if (notes) {
              req.notes = notes;
            }
          }),

        deleteRequest: (requestId) =>
          set((state) => {
            state.requests = state.requests.filter(
              (r) => r.id !== requestId
            );
          }),

        deleteRequestsByEvent: (eventId) =>
          set((state) => {
            state.requests = state.requests.filter(
              (r) => r.eventId !== eventId
            );
          }),

        setRequests: (requests) =>
          set((state) => {
            state.requests = requests;
            state.isLoading = false;
            state.error = null;
          }),

        /* ------------------ GETTERS ------------------ */

        getRequestsByEvent: (eventId) => {
          return get().requests.filter(
            (r) => r.eventId === eventId
          );
        },

        getRequestById: (requestId) => {
          return get().requests.find(
            (r) => r.id === requestId
          );
        },

        getRequestsByUser: (userId) => {
          return get().requests.filter(
            (r) =>
              r.domain === 'regular' &&
              'userId' in r &&
              r.userId === userId
          );
        },

        getRequestsByDomain: (eventId, domain) => {
          return get().requests.filter(
            (r) =>
              r.eventId === eventId &&
              r.domain === domain
          );
        },

        getRequestsByStatus: (eventId, status) => {
          return get().requests.filter(
            (r) =>
              r.eventId === eventId &&
              r.status === status
          );
        },

        getEventStats: (eventId) => {
          const eventRequests = get().requests.filter(
            (r) => r.eventId === eventId
          );

          return {
            pending: eventRequests.filter(
              (r) => r.status === 'pending'
            ).length,
            accepted: eventRequests.filter(
              (r) => r.status === 'accepted'
            ).length,
            rejected: eventRequests.filter(
              (r) => r.status === 'rejected'
            ).length,
            total: eventRequests.length,
          };
        },
      })),
      {
        name: 'registration-request-store',
      }
    )
  );

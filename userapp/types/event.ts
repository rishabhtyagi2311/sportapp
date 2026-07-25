// types/event.ts — real, server-backed Event Management shapes.

export type EventType = 'regular' | 'footballtournament';
export type TournamentFormat = 'league' | 'knockout';
export type ParticipationType = 'individual' | 'team';
export type EventFeeType = 'per_person' | 'per_team' | 'total';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type RegistrationStatus = 'pending' | 'accepted' | 'rejected';

export interface EventItem {
  id: string;
  creatorId: number;
  venueId?: string;
  venueName?: string;
  locationName?: string;
  name: string;
  description?: string;
  eventType: EventType;
  tournamentFormat?: TournamentFormat;
  sportName: string;
  participationType: ParticipationType;
  teamSize?: number;
  maxParticipants: number;
  currentParticipants: number;
  dateTime: string;
  duration: number;
  feeAmount: number;
  feeCurrency: string;
  feeType: EventFeeType;
  organizerName: string;
  organizerContact: string;
  status: EventStatus;
  isPublic: boolean;
  registrationDeadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId?: number;
  footballTeamId?: number;
  teamName?: string;
  registrantName?: string;
  status: RegistrationStatus;
  notes?: string;
  processedAt?: string;
  processedBy?: number;
  createdAt: string;
  updatedAt: string;
  event?: EventItem;
}

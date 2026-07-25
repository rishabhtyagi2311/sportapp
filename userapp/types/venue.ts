// types/venue.ts — real, server-backed venue slot/booking shapes.
// Distinct from the dummy-data-era shapes in types/booking.ts (TimeSlot there
// doesn't have a `date`/`status`, since it was never wired to a real backend).

export type SlotStatus = 'available' | 'blocked' | 'booked' | 'match_session';

export interface VenueSlot {
  id: string;
  venueId: string;
  varietyId: string;
  varietyName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: SlotStatus;
}

export interface UserBooking {
  id: string;
  venueId: string;
  venueName?: string;
  userId: number | null;
  slotId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  bookingType: string;
  participants: number | null;
  createdAt: string;
  updatedAt: string;
}

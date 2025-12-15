import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { 
  Venue, 
  CreateVenueInput, 
  TimeSlot, 
  Sport, 
  Amenity,
  OperatingHours,
  WeeklyOperatingHours 
} from '@/types/venue'

/* -------------------------------------------------------------------------- */
/* HELPER: ID GENERATOR (Replaces uuid library)                               */
/* -------------------------------------------------------------------------- */
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/* -------------------------------------------------------------------------- */
/* INITIAL DRAFT STATE                                                        */
/* -------------------------------------------------------------------------- */

const defaultDay: OperatingHours = { open: '09:00', close: '22:00', isOpen: true }
const defaultWeek: WeeklyOperatingHours = {
  monday: { ...defaultDay }, tuesday: { ...defaultDay }, wednesday: { ...defaultDay },
  thursday: { ...defaultDay }, friday: { ...defaultDay }, saturday: { ...defaultDay }, sunday: { ...defaultDay }
}

const initialDraft: CreateVenueInput = {
  name: '',
  description: '',
  address: { street: '', city: '', state: '', pincode: '' },
  contactInfo: { phone: '', email: '', whatsapp: '' },
  sports: [],
  amenities: [],
  images: [],
  operatingHours: defaultWeek,
  timeSlots: [],
  policies: { cancellationPolicy: '', advanceBookingDays: 30, minimumBookingHours: 1 },
  isActive: true,
}

/* -------------------------------------------------------------------------- */
/* STORE INTERFACE                                                            */
/* -------------------------------------------------------------------------- */

interface VenueState {
  /* ---------- DATA ---------- */
  venues: Venue[]
  availableSports: Sport[]
  availableAmenities: Amenity[]
  
  /* ---------- DRAFT STATE (For the Wizard) ---------- */
  draftVenue: CreateVenueInput

  /* ---------- UI STATE ---------- */
  isLoading: boolean
  error: string | null
  selectedVenueId: string | null 

  /* ---------- ACTIONS: DRAFT ---------- */
  updateDraftVenue: (updates: Partial<CreateVenueInput>) => void
  updateDraftContact: (updates: Partial<CreateVenueInput['contactInfo']>) => void
  updateDraftAddress: (updates: Partial<CreateVenueInput['address']>) => void
  resetDraftVenue: () => void

  /* ---------- ACTIONS: VENUE CRUD ---------- */
  setVenues: (venues: Venue[]) => void
  submitDraftVenue: () => void // Moves draft to real list
  deleteVenue: (id: string) => void
  
  /* ---------- ACTIONS: SLOTS ---------- */
  addTimeSlot: (venueId: string, slot: Omit<TimeSlot, 'id'>) => void

  /* ---------- GETTERS ---------- */
  getVenueById: (id: string) => Venue | undefined
}

/* -------------------------------------------------------------------------- */
/* STORE IMPLEMENTATION                                                       */
/* -------------------------------------------------------------------------- */

export const useVenueStore = create<VenueState>()(
  devtools(
    immer((set, get) => ({
      
      /* STATE */
      venues: [],
      availableSports: [],
      availableAmenities: [],
      draftVenue: initialDraft, 
      isLoading: false,
      error: null,
      selectedVenueId: null,

      /* DRAFT ACTIONS */
      updateDraftVenue: (updates) => set((state) => {
        Object.assign(state.draftVenue, updates)
      }),

      updateDraftContact: (updates) => set((state) => {
        Object.assign(state.draftVenue.contactInfo, updates)
      }),

      updateDraftAddress: (updates) => set((state) => {
        Object.assign(state.draftVenue.address, updates)
      }),

      resetDraftVenue: () => set((state) => {
        state.draftVenue = initialDraft
      }),

      /* VENUE CRUD */
      submitDraftVenue: () => set((state) => {
        const newVenue: Venue = {
          ...state.draftVenue,
          id: generateId(), // <--- Fixed: Uses local helper
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rating: 0,
          reviewCount: 0,
        }
        state.venues.push(newVenue)
        state.draftVenue = initialDraft // Reset after submit
      }),

      setVenues: (venues) => set((state) => { state.venues = venues }),
      
      deleteVenue: (id) => set((state) => {
        state.venues = state.venues.filter(v => v.id !== id)
      }),

      /* SLOTS */
      addTimeSlot: (venueId, slotInput) => set((state) => {
        const venue = state.venues.find(v => v.id === venueId)
        if (venue) {
          venue.timeSlots.push({ ...slotInput, id: generateId() }) // <--- Fixed here too
        }
      }),

      /* GETTERS */
      getVenueById: (id) => get().venues.find(v => v.id === id),
    }))
  )
)
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { 
  Venue, 
  CreateVenueInput, 
  OperatingHours,
  WeeklyOperatingHours 
} from '@/types/venue'
import { venueApiService } from '@/services/venueManagement/venue'

/* -------------------------------------------------------------------------- */
/* INITIAL DRAFT STATE                                                        */
/* -------------------------------------------------------------------------- */
const defaultDay: OperatingHours = { open: '09:00', close: '22:00', isOpen: true }
const defaultWeek: WeeklyOperatingHours = {
  monday: { ...defaultDay }, 
  tuesday: { ...defaultDay }, 
  wednesday: { ...defaultDay },
  thursday: { ...defaultDay }, 
  friday: { ...defaultDay }, 
  saturday: { ...defaultDay }, 
  sunday: { ...defaultDay }
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
  
  /* ---------- DRAFT STATE (For the Wizard) ---------- */
  draftVenue: CreateVenueInput

  /* ---------- UI STATE ---------- */
  isLoading: boolean
  error: string | null

  /* ---------- ACTIONS: DRAFT ---------- */
  updateDraftVenue: (updates: Partial<CreateVenueInput>) => void
  updateDraftContact: (updates: Partial<CreateVenueInput['contactInfo']>) => void
  updateDraftAddress: (updates: Partial<CreateVenueInput['address']>) => void
  resetDraftVenue: () => void

  /* ---------- ACTIONS: API CRUD ---------- */
  fetchMyVenues: () => Promise<void>
  submitDraftVenue: () => Promise<void>
  
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
      draftVenue: initialDraft, 
      isLoading: false,
      error: null,

      /* DRAFT ACTIONS (WIZARD) */
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

      /* API ACTIONS */
      fetchMyVenues: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await venueApiService.getMyVenues();
          // The backend returns { success: true, data: [...] }
          if (response.success) {
            set((state) => {
              state.venues = response.data;
              state.isLoading = false;
            });
          }
        } catch (err: any) {
          set({ 
            error: err.response?.data?.message || "Failed to load venues", 
            isLoading: false 
          });
        }
      },

      submitDraftVenue: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await venueApiService.createVenue(get().draftVenue);
          
          if (response.success) {
            // After successful creation, refresh the list and reset the wizard
            await get().fetchMyVenues();
            get().resetDraftVenue();
          }
        } catch (err: any) {
          const errorMsg = err.response?.data?.message || "Error creating venue";
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg); 
        }
      },

      /* GETTERS */
      getVenueById: (id) => get().venues.find(v => v.id === id),
    }))
  )
)
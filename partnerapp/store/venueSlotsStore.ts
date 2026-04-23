// @/store/slotStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { TimeSlot } from '@/types/venue'
import { venueApiService } from '@/services/venueManagement/venue'

interface SlotState {
  selectedDate: string // YYYY-MM-DD
  slots: TimeSlot[]
  isLoading: boolean
  error: string | null

  // Actions
  setSelectedDate: (date: string) => void
  loadSlots: (venueId: string, date: string) => Promise<void>
}

export const useSlotStore = create<SlotState>()(
  devtools(
    immer((set) => ({
      selectedDate: new Date().toISOString().split('T')[0],
      slots: [],
      isLoading: false,
      error: null,

      setSelectedDate: (date) => set((state) => {
        state.selectedDate = date;
      }),

      loadSlots: async (venueId, date) => {
        set({ isLoading: true, error: null });
        try {
          const response = await venueApiService.getSlots(venueId, date);
          if (response.success) {
            set({ slots: response.data });
          }
        } catch (err: any) {
          set({ error: err.message || "Failed to load slots" });
        } finally {
          set({ isLoading: false });
        }
      }
    }))
  )
)
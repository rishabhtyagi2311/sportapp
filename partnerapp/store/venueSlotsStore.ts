// @/store/slotStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { VenueSlot } from '@/types/venue'
import { venueApiService } from '@/services/venueManagement/venue'

interface SlotState {
  selectedDate: string // YYYY-MM-DD
  slots: VenueSlot[]
  isLoading: boolean
  error: string | null

  // Actions
  setSelectedDate: (date: string) => void
  loadSlots: (venueId: string, date: string) => Promise<void>
  generateSlots: (venueId: string, date: string) => Promise<number>
  updateSlotPrice: (slotId: string, price: number) => Promise<void>
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
      },

      // Tops up the rolling window from today (not `date`, which is only the
      // currently-viewed tab and gets re-fetched afterwards to reflect any
      // newly created slots). Returns the number of slots actually created,
      // since dedup means most manual top-ups within an already-covered
      // window legitimately generate 0 new rows.
      generateSlots: async (venueId, date) => {
        set({ isLoading: true, error: null });
        try {
          const genResponse = await venueApiService.generateSlots(venueId, {});
          const response = await venueApiService.getSlots(venueId, date);
          if (response.success) {
            set({ slots: response.data });
          }
          return genResponse.data?.generatedCount ?? 0;
        } catch (err: any) {
          set({ error: err.message || "Failed to generate slots" });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      updateSlotPrice: async (slotId, price) => {
        const response = await venueApiService.updateSlot(slotId, { price });
        if (response.success) {
          set((state) => {
            const slot = state.slots.find((s) => s.id === slotId);
            if (slot) slot.price = price;
          });
        }
      }
    }))
  )
)
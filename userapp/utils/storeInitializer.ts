// utils/storeInitializer.ts
import { useBookingStore } from '@/store/venueStore';

/**
 * Fetch real venues from the server into the booking store.
 * Call this once when your app starts, preferably in App.tsx or your root component.
 * Events now live in their own real backend (see store/eventManagerStore.ts) and
 * are fetched independently by the screens that browse them.
 */
export const initializeBookingStore = () => {
  const store = useBookingStore.getState();

  if (store.venues.length === 0) {
    store.fetchVenues().catch((err) => console.log('[storeInitializer] fetchVenues failed:', err.message));
  }
};

/** Re-fetches venues from the server. */
export const resetBookingStore = () => {
  const store = useBookingStore.getState();
  store.fetchVenues().catch((err) => console.log('[storeInitializer] fetchVenues failed:', err.message));
};

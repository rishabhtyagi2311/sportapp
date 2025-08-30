// utils/storeInitializer.ts
import { useBookingStore } from '@/store/venueStore';
import { initializeStoreWithDummyData } from '@/constants/venueData';

/**
 * Initialize the booking store with dummy data
 * Call this once when your app starts, preferably in App.tsx or your root component
 */
export const initializeBookingStore = () => {
  const store = useBookingStore.getState();
  const dummyData = initializeStoreWithDummyData();
  
  // Check if store is already initialized (has data)
  if (store.venues.length === 0) {
    console.log('Initializing booking store with dummy data...');
    
    store.setVenues(dummyData.venues);
    store.setEvents(dummyData.events);
    
    // Set master data for amenities and sports
    useBookingStore.setState((state) => ({
      ...state,
      amenities: dummyData.amenities,
      sports: dummyData.sports,
    }));
    
    console.log('Booking store initialized successfully!');
  } else {
    console.log('Booking store already has data, skipping initialization');
  }
};

/**
 * Reset the store and reinitialize with fresh dummy data
 * Useful during development or testing
 */
export const resetBookingStore = () => {
  const store = useBookingStore.getState();
  const dummyData = initializeStoreWithDummyData();
  
  console.log('Resetting booking store...');
  
  store.setVenues(dummyData.venues);
  store.setEvents(dummyData.events);
  
  useBookingStore.setState((state) => ({
    ...state,
    amenities: dummyData.amenities,
    sports: dummyData.sports,
    bookings: [], // Clear existing bookings
  }));
  
  console.log('Booking store reset successfully!');
};
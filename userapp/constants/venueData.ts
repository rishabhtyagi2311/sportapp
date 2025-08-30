// data/dummyData.ts

import { Venue, Event, Amenity, Sport, TimeSlot } from '../types/booking';

// Master amenities list
export const masterAmenities: Amenity[] = [
  // Basic amenities
  { id: 'parking', name: 'Parking', category: 'basic', icon: '🚗', description: 'Free parking available' },
  { id: 'drinking_water', name: 'Drinking Water', category: 'basic', icon: '💧', description: 'Clean drinking water facility' },
  { id: 'washroom', name: 'Washroom', category: 'basic', icon: '🚻', description: 'Clean washroom facilities' },
  { id: 'first_aid', name: 'First Aid', category: 'basic', icon: '🏥', description: 'First aid kit and basic medical assistance' },
  
  // Facilities
  { id: 'changing_room', name: 'Changing Room', category: 'facilities', icon: '👕', description: 'Separate changing rooms for men and women' },
  { id: 'locker_room', name: 'Locker Room', category: 'facilities', icon: '🔐', description: 'Secure lockers for personal belongings' },
  { id: 'shower', name: 'Shower', category: 'facilities', icon: '🚿', description: 'Hot and cold shower facilities' },
  { id: 'cafeteria', name: 'Cafeteria', category: 'facilities', icon: '🍔', description: 'Food and beverages available' },
  { id: 'spectator_seating', name: 'Spectator Seating', category: 'facilities', icon: '🪑', description: 'Seating arrangement for spectators' },
  { id: 'air_conditioning', name: 'Air Conditioning', category: 'facilities', icon: '❄️', description: 'Climate controlled environment' },
  { id: 'lighting', name: 'Floodlights', category: 'facilities', icon: '💡', description: 'Professional lighting for night games' },
  
  // Sports Equipment
  { id: 'cricket_equipment', name: 'Cricket Equipment', category: 'sports_equipment', icon: '🏏', description: 'Bats, balls, stumps, and protective gear' },
  { id: 'football_equipment', name: 'Football Equipment', category: 'sports_equipment', icon: '⚽', description: 'Footballs and goal posts' },
  { id: 'badminton_equipment', name: 'Badminton Equipment', category: 'sports_equipment', icon: '🏸', description: 'Rackets and shuttlecocks' },
  { id: 'tennis_equipment', name: 'Tennis Equipment', category: 'sports_equipment', icon: '🎾', description: 'Rackets and tennis balls' },
  { id: 'basketball_equipment', name: 'Basketball Equipment', category: 'sports_equipment', icon: '🏀', description: 'Basketballs and proper hoops' },
  
  // Services
  { id: 'ball_boy', name: 'Ball Boy Service', category: 'services', icon: '👦', description: 'Professional ball boy service during games' },
  { id: 'referee', name: 'Referee Service', category: 'services', icon: '👨‍⚖️', description: 'Qualified referee for matches' },
  { id: 'cleaning_service', name: 'Cleaning Service', category: 'services', icon: '🧹', description: 'Regular cleaning and maintenance' },
  { id: 'security', name: 'Security', category: 'services', icon: '👮', description: '24/7 security service' },
  { id: 'photography', name: 'Photography Service', category: 'services', icon: '📸', description: 'Professional photography for events' },
];

// Master sports list
export const masterSports: Sport[] = [
  {
    id: 'cricket',
    name: 'Cricket',
    category: 'outdoor',
    details: [
      {
        id: 'box_cricket',
        sportType: 'Box Cricket',
        specifications: {
          fieldType: 'Box',
          dimensions: '30x30 feet',
          playerCount: 6,
          overLimit: 6,
          boundaryHeight: '12 feet'
        }
      },
      {
        id: 'turf_cricket',
        sportType: 'Turf Cricket',
        specifications: {
          fieldType: 'Turf',
          dimensions: '22 yards',
          playerCount: 11,
          format: 'T20/ODI/Test',
          pitchType: 'Natural/Artificial'
        }
      }
    ]
  },
  {
    id: 'football',
    name: 'Football',
    category: 'outdoor',
    details: [
      {
        id: 'football_7x7',
        sportType: '7v7 Football',
        specifications: {
          fieldSize: '50x30 meters',
          playerCount: 7,
          goalSize: '12x6 feet',
          matchDuration: '30 minutes'
        }
      },
      {
        id: 'football_11x11',
        sportType: '11v11 Football',
        specifications: {
          fieldSize: '100x50 meters',
          playerCount: 11,
          goalSize: '24x8 feet',
          matchDuration: '90 minutes'
        }
      }
    ]
  },
  {
    id: 'badminton',
    name: 'Badminton',
    category: 'indoor',
    details: [
      {
        id: 'badminton_singles',
        sportType: 'Singles',
        specifications: {
          courtSize: '13.4x5.18 meters',
          netHeight: '1.55 meters',
          playerCount: 1,
          gameFormat: 'Best of 3'
        }
      },
      {
        id: 'badminton_doubles',
        sportType: 'Doubles',
        specifications: {
          courtSize: '13.4x6.1 meters',
          netHeight: '1.55 meters',
          playerCount: 2,
          gameFormat: 'Best of 3'
        }
      }
    ]
  },
  {
    id: 'tennis',
    name: 'Tennis',
    category: 'outdoor',
    details: [
      {
        id: 'tennis_singles',
        sportType: 'Singles',
        specifications: {
          courtSize: '23.77x8.23 meters',
          netHeight: '0.914 meters',
          playerCount: 1,
          surfaceType: 'Hard/Clay/Grass'
        }
      }
    ]
  },
  {
    id: 'basketball',
    name: 'Basketball',
    category: 'outdoor',
    details: [
      {
        id: 'basketball_full',
        sportType: 'Full Court',
        specifications: {
          courtSize: '28x15 meters',
          hoopHeight: '3.05 meters',
          playerCount: 5,
          gameDuration: '48 minutes'
        }
      },
      {
        id: 'basketball_3x3',
        sportType: '3x3 Basketball',
        specifications: {
          courtSize: '15x11 meters',
          hoopHeight: '3.05 meters',
          playerCount: 3,
          gameDuration: '21 points'
        }
      }
    ]
  }
];

// Time slots templates
const generateTimeSlots = (basePrice: number): TimeSlot[] => [
  { id: 'slot_6_8', startTime: '06:00', endTime: '08:00', isAvailable: true, price: basePrice * 0.8, priceType: 'per_hour' },
  { id: 'slot_8_10', startTime: '08:00', endTime: '10:00', isAvailable: true, price: basePrice, priceType: 'per_hour' },
  { id: 'slot_10_12', startTime: '10:00', endTime: '12:00', isAvailable: true, price: basePrice * 1.2, priceType: 'per_hour' },
  { id: 'slot_12_14', startTime: '12:00', endTime: '14:00', isAvailable: false, price: basePrice * 1.1, priceType: 'per_hour' },
  { id: 'slot_14_16', startTime: '14:00', endTime: '16:00', isAvailable: true, price: basePrice * 1.1, priceType: 'per_hour' },
  { id: 'slot_16_18', startTime: '16:00', endTime: '18:00', isAvailable: true, price: basePrice * 1.3, priceType: 'per_hour' },
  { id: 'slot_18_20', startTime: '18:00', endTime: '20:00', isAvailable: true, price: basePrice * 1.5, priceType: 'per_hour' },
  { id: 'slot_20_22', startTime: '20:00', endTime: '22:00', isAvailable: true, price: basePrice * 1.4, priceType: 'per_hour' },
];

// Dummy venues
export const dummyVenues: Venue[] = [
  {
    id: 'venue_1',
    name: 'SportZone Cricket Academy',
    address: {
      street: 'Sector 62, Near Metro Station',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201309',
      coordinates: { latitude: 28.6303, longitude: 77.3823 }
    },
    contactInfo: {
      phone: '+91-9876543210',
      email: 'info@sportzone.com',
      whatsapp: '+91-9876543210'
    },
    sports: [masterSports[0]], // Cricket
    amenities: [
      masterAmenities[0], // parking
      masterAmenities[1], // drinking water
      masterAmenities[2], // washroom
      masterAmenities[4], // changing room
      masterAmenities[5], // locker room
      masterAmenities[10], // lighting
      masterAmenities[11], // cricket equipment
      masterAmenities[16], // ball boy
    ],
    images: [
      'https://example.com/venue1_1.jpg',
      'https://example.com/venue1_2.jpg',
      'https://example.com/venue1_3.jpg'
    ],
    rating: 4.5,
    reviewCount: 128,
    operatingHours: {
      monday: { open: '06:00', close: '22:00', isOpen: true },
      tuesday: { open: '06:00', close: '22:00', isOpen: true },
      wednesday: { open: '06:00', close: '22:00', isOpen: true },
      thursday: { open: '06:00', close: '22:00', isOpen: true },
      friday: { open: '06:00', close: '22:00', isOpen: true },
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '07:00', close: '23:00', isOpen: true },
    },
    timeSlots: generateTimeSlots(800),
    policies: {
      cancellationPolicy: 'Free cancellation up to 2 hours before booking time',
      advanceBookingDays: 7,
      minimumBookingHours: 1
    },
    isActive: true,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-20T15:30:00.000Z'
  },
  {
    id: 'venue_2',
    name: 'Elite Badminton Center',
    address: {
      street: 'Indirapuram, Habitat Center',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201014',
      coordinates: { latitude: 28.6422, longitude: 77.3707 }
    },
    contactInfo: {
      phone: '+91-9876543211',
      email: 'elite@badminton.com'
    },
    sports: [masterSports[2]], // Badminton
    amenities: [
      masterAmenities[0], // parking
      masterAmenities[1], // drinking water
      masterAmenities[2], // washroom
      masterAmenities[4], // changing room
      masterAmenities[6], // shower
      masterAmenities[9], // air conditioning
      masterAmenities[13], // badminton equipment
      masterAmenities[7], // cafeteria
    ],
    images: [
      'https://example.com/venue2_1.jpg',
      'https://example.com/venue2_2.jpg'
    ],
    rating: 4.7,
    reviewCount: 89,
    operatingHours: {
      monday: { open: '05:30', close: '23:00', isOpen: true },
      tuesday: { open: '05:30', close: '23:00', isOpen: true },
      wednesday: { open: '05:30', close: '23:00', isOpen: true },
      thursday: { open: '05:30', close: '23:00', isOpen: true },
      friday: { open: '05:30', close: '23:30', isOpen: true },
      saturday: { open: '05:30', close: '23:30', isOpen: true },
      sunday: { open: '06:00', close: '23:30', isOpen: true },
    },
    timeSlots: generateTimeSlots(400),
    policies: {
      cancellationPolicy: 'Free cancellation up to 1 hour before booking time',
      advanceBookingDays: 3,
      minimumBookingHours: 1
    },
    isActive: true,
    createdAt: '2024-01-10T08:00:00.000Z',
    updatedAt: '2024-01-25T12:15:00.000Z'
  },
  {
    id: 'venue_3',
    name: 'Champions Football Turf',
    address: {
      street: 'Raj Nagar Extension',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201017',
      coordinates: { latitude: 28.6816, longitude: 77.4095 }
    },
    contactInfo: {
      phone: '+91-9876543212',
      whatsapp: '+91-9876543212'
    },
    sports: [masterSports[1]], // Football
    amenities: [
      masterAmenities[0], // parking
      masterAmenities[1], // drinking water
      masterAmenities[2], // washroom
      masterAmenities[4], // changing room
      masterAmenities[6], // shower
      masterAmenities[8], // spectator seating
      masterAmenities[10], // lighting
      masterAmenities[12], // football equipment
      masterAmenities[17], // referee
      masterAmenities[19], // security
    ],
    images: [
      'https://example.com/venue3_1.jpg',
      'https://example.com/venue3_2.jpg',
      'https://example.com/venue3_3.jpg',
      'https://example.com/venue3_4.jpg'
    ],
    rating: 4.3,
    reviewCount: 156,
    operatingHours: {
      monday: { open: '06:00', close: '22:00', isOpen: true },
      tuesday: { open: '06:00', close: '22:00', isOpen: true },
      wednesday: { open: '06:00', close: '22:00', isOpen: true },
      thursday: { open: '06:00', close: '22:00', isOpen: true },
      friday: { open: '06:00', close: '23:00', isOpen: true },
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '07:00', close: '22:00', isOpen: true },
    },
    timeSlots: generateTimeSlots(1200),
    policies: {
      cancellationPolicy: 'Free cancellation up to 4 hours before booking time',
      advanceBookingDays: 14,
      minimumBookingHours: 1
    },
    isActive: true,
    createdAt: '2024-01-05T14:30:00.000Z',
    updatedAt: '2024-01-22T18:45:00.000Z'
  }
];

// Dummy events
export const dummyEvents: Event[] = [
  {
    id: 'event_1',
    venueId: 'venue_1',
    name: 'Sunday Cricket Championship',
    description: 'Weekly cricket tournament for amateur players. All skill levels welcome!',
    eventType: 'tournament',
    sport: masterSports[0],
    participationType: 'team',
    teamSize: 11,
    maxParticipants: 88, // 8 teams
    currentParticipants: 44, // 4 teams registered
    dateTime: '2025-09-07T09:00:00.000Z',
    duration: 6,
    fees: {
      amount: 2500,
      currency: 'INR',
      type: 'per_team'
    },
    organizer: {
      name: 'SportZone Events',
      contact: '+91-9876543210'
    },
    requirements: [
      'Team of 11 players',
      'Cricket kit required',
      'Valid ID for all players',
      'Registration closes 24 hours before event'
    ],
    status: 'upcoming',
    isPublic: true,
    registrationDeadline: '2025-09-06T18:00:00.000Z',
    createdAt: '2024-08-15T10:00:00.000Z',
    updatedAt: '2024-08-25T14:30:00.000Z'
  },
  {
    id: 'event_2',
    venueId: 'venue_2',
    name: 'Badminton Singles Open',
    description: 'Individual badminton tournament with prizes for winners',
    eventType: 'tournament',
    sport: masterSports[2],
    participationType: 'individual',
    maxParticipants: 32,
    currentParticipants: 18,
    dateTime: '2025-09-14T07:00:00.000Z',
    duration: 8,
    fees: {
      amount: 300,
      currency: 'INR',
      type: 'per_person'
    },
    organizer: {
      name: 'Elite Sports Club',
      contact: '+91-9876543211'
    },
    requirements: [
      'Intermediate level players preferred',
      'Own racket required',
      'Sports attire mandatory'
    ],
    status: 'upcoming',
    isPublic: true,
    registrationDeadline: '2025-09-12T20:00:00.000Z',
    createdAt: '2024-08-20T12:00:00.000Z',
    updatedAt: '2024-08-28T16:15:00.000Z'
  },
  {
    id: 'event_3',
    venueId: 'venue_3',
    name: 'Friday Night Football League',
    description: 'Weekly 7v7 football matches for corporate teams',
    eventType: 'league',
    sport: masterSports[1],
    participationType: 'team',
    teamSize: 7,
    maxParticipants: 42, // 6 teams
    currentParticipants: 35, // 5 teams
    dateTime: '2025-09-06T19:00:00.000Z',
    duration: 3,
    fees: {
      amount: 1800,
      currency: 'INR',
      type: 'per_team'
    },
    organizer: {
      name: 'Champions League Organizers',
      contact: '+91-9876543212'
    },
    requirements: [
      'Corporate teams only',
      'Team of 7 + 3 substitutes',
      'Football boots recommended',
      'Company ID required'
    ],
    status: 'upcoming',
    isPublic: false,
    registrationDeadline: '2025-09-05T17:00:00.000Z',
    createdAt: '2024-08-10T09:30:00.000Z',
    updatedAt: '2024-08-30T11:20:00.000Z'
  },
  {
    id: 'event_4',
    venueId: 'venue_1',
    name: 'Box Cricket Blast',
    description: 'Fast-paced 6-over box cricket tournament',
    eventType: 'tournament',
    sport: {
      ...masterSports[0],
      details: [masterSports[0].details![0]] // Only box cricket
    },
    participationType: 'team',
    teamSize: 6,
    maxParticipants: 48, // 8 teams
    currentParticipants: 30, // 5 teams
    dateTime: '2025-09-15T16:00:00.000Z',
    duration: 4,
    fees: {
      amount: 1500,
      currency: 'INR',
      type: 'per_team'
    },
    organizer: {
      name: 'Box Cricket Association',
      contact: '+91-9876543213'
    },
    requirements: [
      'Team of 6 players',
      'Colored jerseys preferred',
      'All equipment provided'
    ],
    status: 'upcoming',
    isPublic: true,
    registrationDeadline: '2025-09-14T12:00:00.000Z',
    createdAt: '2024-08-25T15:45:00.000Z',
    updatedAt: '2024-08-29T10:30:00.000Z'
  }
];

// Function to initialize store with dummy data
export const initializeStoreWithDummyData = () => {
  return {
    venues: dummyVenues,
    events: dummyEvents,
    amenities: masterAmenities,
    sports: masterSports,
  };
};
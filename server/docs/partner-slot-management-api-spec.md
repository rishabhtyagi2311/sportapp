# Partner Slot Management API Specification

## Purpose
This document defines the backend APIs required for the partner venue and slot management module. It is intended as a handoff specification for another LLM or developer to implement the full backend.

## Current state of the codebase
The current server already supports:
- creating a venue
- creating an initial set of time slots for the venue

What is still missing is the full slot-management workflow for partners:
- viewing slots by venue/date
- updating slot status
- blocking slots manually
- viewing bookings for a venue
- creating match sessions

## Intended backend conventions
- All partner APIs should be protected with the existing partner auth middleware.
- Use the existing partner identity from the JWT.
- Route prefix should be: `/api/v1/partner`
- Response format should be consistent:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error responses should return:

```json
{
  "success": false,
  "message": "Readable error message"
}
```

---

## 1) Venue APIs

### 1.1 GET /api/v1/partner/venues
Description:
Fetch all venues owned by the authenticated partner.

Auth:
Required, partner token.

Params:
- none

Query params:
- `includeSlots` (optional, boolean): if true, include slot summary for each venue

Behavior:
- Find venues where `partnerId` matches the authenticated partner.
- Return venue details and optional slot summary.

Response shape:
```json
{
  "success": true,
  "data": [
    {
      "id": "venue_123",
      "name": "Elite Turf",
      "city": "Bangalore",
      "state": "Karnataka",
      "isActive": true,
      "sports": [],
      "operatingHours": {},
      "address": {},
      "images": []
    }
  ]
}
```

---

### 1.2 POST /api/v1/partner/venues
Description:
Create a new venue and generate initial slots.

Auth:
Required.

Body params:
- `name` (string, required)
- `description` (string, required)
- `address` (object, required)
  - `street` (string)
  - `city` (string)
  - `state` (string)
  - `pincode` (string)
  - `coordinates` (object, optional)
    - `latitude` (number)
    - `longitude` (number)
- `contactInfo` (object, required)
- `operatingHours` (object, required)
- `sports` (array, required)
- `amenities` (array, required)
- `images` (array, required)
- `timeSlots` (array, required)
  - each item should include at least `price`

Behavior:
- Create the venue linked to the authenticated partner.
- Create address and images.
- Generate initial slots for the next 30 days based on operating hours.

Response shape:
```json
{
  "success": true,
  "message": "Venue created and slots generated successfully",
  "data": {
    "id": "venue_123",
    "name": "Elite Turf"
  }
}
```

---

### 1.3 GET /api/v1/partner/venues/:venueId
Description:
Fetch one venue with its details.

Auth:
Required.

Params:
- `venueId` (string, required)

Behavior:
- Verify that the venue belongs to the authenticated partner.
- Return venue + nested address/images.

---

### 1.4 PUT /api/v1/partner/venues/:venueId
Description:
Update venue information such as name, description, operating hours, or status.

Auth:
Required.

Params:
- `venueId` (string, required)

Body params:
- any updatable venue fields

Behavior:
- Update the venue record.
- If operating hours change, optionally regenerate future slots.

---

## 2) Slot APIs

### 2.1 GET /api/v1/partner/venues/:venueId/slots
Description:
Return all slots for a venue for a specific date or date range.

Auth:
Required.

Params:
- `venueId` (string, required)

Query params:
- `date` (string, optional, format `YYYY-MM-DD`)
- `startDate` (string, optional)
- `endDate` (string, optional)
- `varietyId` (string, optional)
- `status` (optional, filter by `available`, `booked`, `blocked`, `match_session`)

Behavior:
- Find time slots for the venue.
- Filter by date and optional variety/status.
- Return slot list sorted by start time.

Response shape:
```json
{
  "success": true,
  "data": [
    {
      "id": "slot_001",
      "venueId": "venue_123",
      "varietyId": "variety_1",
      "varietyName": "Pitch 1",
      "date": "2026-06-26",
      "startTime": "10:00",
      "endTime": "10:30",
      "price": 1000,
      "status": "available"
    }
  ]
}
```

---

### 2.2 POST /api/v1/partner/venues/:venueId/slots/generate
Description:
Generate future slots for an existing venue.

Auth:
Required.

Params:
- `venueId` (string, required)

Body params:
- `daysCount` (number, optional, default 30)
- `basePrice` (number, optional)
- `startDate` (string, optional, format `YYYY-MM-DD`)

Behavior:
- Create missing slots for the requested future range based on the venue’s operating hours and sports/varieties.
- Avoid duplicates using `skipDuplicates` or an upsert strategy.

Response shape:
```json
{
  "success": true,
  "message": "Slots generated successfully",
  "data": {
    "generatedCount": 120
  }
}
```

---

### 2.3 PATCH /api/v1/partner/slots/:slotId
Description:
Update an individual slot.

Auth:
Required.

Params:
- `slotId` (string, required)

Body params:
- `status` (string, optional): `available`, `booked`, `blocked`, `match_session`
- `price` (number, optional)
- `reason` (string, optional, for blocking)

Behavior:
- Update the slot record.
- If status is changed to `blocked`, optionally record a block reason.
- If the slot is already booked or part of a match session, reject invalid transitions.

Response shape:
```json
{
  "success": true,
  "data": {
    "id": "slot_001",
    "status": "blocked"
  }
}
```

---

## 3) Manual block APIs

### 3.1 POST /api/v1/partner/slots/blocks
Description:
Create a manual block on a slot.

Auth:
Required.

Body params:
- `venueId` (string, required)
- `slotId` (string, required)
- `reason` (string, required)
- `date` (string, optional, format `YYYY-MM-DD`)

Behavior:
- Create a block record for the slot.
- Mark the slot as `blocked` if the slot is currently `available`.

Response shape:
```json
{
  "success": true,
  "data": {
    "id": "block_001",
    "slotId": "slot_001",
    "reason": "Maintenance"
  }
}
```

---

### 3.2 DELETE /api/v1/partner/slots/blocks/:blockId
Description:
Remove a manual block and restore the slot to available state if appropriate.

Auth:
Required.

Params:
- `blockId` (string, required)

Behavior:
- Delete the block record.
- If the slot has no other booking or session conflict, set its status back to `available`.

---

## 4) Booking APIs

### 4.1 GET /api/v1/partner/venues/:venueId/bookings
Description:
Fetch bookings for the venue, optionally filtered by date.

Auth:
Required.

Params:
- `venueId` (string, required)

Query params:
- `date` (string, optional, format `YYYY-MM-DD`)
- `status` (optional, filter by booking status)

Behavior:
- Return bookings belonging to that venue.
- Used by the partner booking list view.

Response shape:
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_001",
      "venueId": "venue_123",
      "date": "2026-06-26",
      "status": "confirmed",
      "guestDetails": {
        "name": "Rahul Sharma",
        "phone": "+91 98765 43210"
      }
    }
  ]
}
```

---

## 5) Match session APIs

### 5.1 POST /api/v1/partner/match-sessions
Description:
Create a match session for a specific slot.

Auth:
Required.

Body params:
- `venueId` (string, required)
- `slotId` (string, required)
- `date` (string, required, format `YYYY-MM-DD`)
- `startTime` (string, required)
- `endTime` (string, required)
- `sport` (string, required)
- `totalPlayers` (number, required)
- `minPlayersForLive` (number, required)
- `pricePerPerson` (number, required)
- `skillLevel` (string, required: `Beginner`, `Intermediate`, `Advanced`, `Open`)
- `description` (string, optional)

Behavior:
- Create a match session record.
- Mark the slot as `match_session`.
- Prevent duplicate session creation for the same slot.

Response shape:
```json
{
  "success": true,
  "message": "Match published successfully",
  "data": {
    "id": "match_001",
    "slotId": "slot_001",
    "status": "pending"
  }
}
```

---

### 5.2 GET /api/v1/partner/venues/:venueId/match-sessions
Description:
List match sessions for a venue.

Auth:
Required.

Params:
- `venueId` (string, required)

Query params:
- `date` (string, optional)
- `status` (optional)

Behavior:
- Return sessions for the venue and optional date/status filters.

---

## Suggested implementation structure
To keep the codebase clean, implement the following:
- Controller: `src/controllers/partner/venueManagement/slot.controller.ts`
- Service: `src/services/partner/venueManagement/slot.service.ts`
- Router: `src/routers/partner/venueManagement/slot.route.ts`
- Mount router in `src/index.ts`

---

## Prisma schema changes required
The current Prisma schema is sufficient for venue creation and basic slot generation, but it needs a few additions to support the full partner slot-management module.

### 1) Add a Booking model
Needed for booking list and slot state resolution.

Suggested fields:
```prisma
model Booking {
  id            String   @id @default(uuid())
  venueId       String
  userId        String?
  slotId        String?
  date          DateTime
  startTime     String
  endTime       String
  totalAmount   Float
  status        String   @default("pending")
  paymentStatus String   @default("pending")
  bookingType   String   @default("venue")
  participants   Int?     @default(1)
  guestName     String?
  guestPhone    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  venue         Venue?   @relation(fields: [venueId], references: [id], onDelete: Cascade)
}
```

### 2) Add a SlotBlock model
Needed for manual blocks created by the partner.

Suggested fields:
```prisma
model SlotBlock {
  id          String   @id @default(uuid())
  venueId     String
  slotId      String
  reason      String
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  venue       Venue    @relation(fields: [venueId], references: [id], onDelete: Cascade)
}
```

### 3) Add a MatchSession model
Needed for the match-session feature.

Suggested fields:
```prisma
model MatchSession {
  id                  String   @id @default(uuid())
  venueId             String
  slotId              String
  partnerId           String
  sport               String
  totalPlayers        Int
  minPlayersForLive   Int
  pricePerPerson      Float
  skillLevel          String
  description         String?
  status              String   @default("pending")
  playersJoined       Int      @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  venue               Venue    @relation(fields: [venueId], references: [id], onDelete: Cascade)
}
```

### 4) Update the Venue model to include relations
Add the new relations to the existing `Venue` model:
```prisma
model Venue {
  ...
  timeSlots       TimeSlot[]
  bookings        Booking[]
  slotBlocks      SlotBlock[]
  matchSessions   MatchSession[]
  ...
}
```

### 5) Update the TimeSlot model for richer slot state
You can keep the current `status` field, but it is better if the schema also supports a nullable relation to booking/session/block if you want direct lookups:
```prisma
model TimeSlot {
  id          String   @id @default(uuid())
  venueId     String
  varietyId   String
  varietyName String
  date        DateTime
  startTime   String
  endTime     String
  price       Float
  status      String   @default("available")
  bookingId   String?
  blockId     String?
  matchSessionId String?
  venue       Venue    @relation(fields: [venueId], references: [id], onDelete: Cascade)

  @@index([venueId, date, varietyId])
}
```

### 6) Add indexes for querying
Recommended indexes:
```prisma
@@index([venueId, date])
@@index([status])
```

---

## Notes for the implementing LLM
1. Do not rely only on the frontend store for booking state. The backend should own and persist slot status.
2. Make sure the partner can only access their own venues.
3. If a slot is booked, blocked, or assigned to a match session, it should not be treated as available.
4. The slot-generation logic should be reusable and should avoid duplicate slot creation.
5. The router must be mounted and the base path must be consistent with the frontend API client.

---

## Minimum implementation priority
If the goal is a working first version, implement these first in order:
1. GET /api/v1/partner/venues/:venueId/slots
2. POST /api/v1/partner/venues/:venueId/slots/generate
3. PATCH /api/v1/partner/slots/:slotId
4. POST /api/v1/partner/slots/blocks
5. DELETE /api/v1/partner/slots/blocks/:blockId
6. GET /api/v1/partner/venues/:venueId/bookings
7. POST /api/v1/partner/match-sessions

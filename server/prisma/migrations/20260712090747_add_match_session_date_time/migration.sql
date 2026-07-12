-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "userId" TEXT,
    "slotId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "bookingType" TEXT NOT NULL DEFAULT 'venue',
    "participants" INTEGER DEFAULT 1,
    "guestName" TEXT,
    "guestPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SlotBlock" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlotBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchSession" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "totalPlayers" INTEGER NOT NULL,
    "minPlayersForLive" INTEGER NOT NULL,
    "pricePerPerson" DOUBLE PRECISION NOT NULL,
    "skillLevel" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "playersJoined" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimeSlot_status_idx" ON "public"."TimeSlot"("status");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SlotBlock" ADD CONSTRAINT "SlotBlock_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchSession" ADD CONSTRAINT "MatchSession_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

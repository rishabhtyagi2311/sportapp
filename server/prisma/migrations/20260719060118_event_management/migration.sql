-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "venueId" TEXT,
    "locationName" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "tournamentFormat" TEXT,
    "sportName" TEXT NOT NULL,
    "participationType" TEXT NOT NULL,
    "teamSize" INTEGER,
    "maxParticipants" INTEGER NOT NULL,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "feeAmount" DOUBLE PRECISION NOT NULL,
    "feeCurrency" TEXT NOT NULL DEFAULT 'INR',
    "feeType" TEXT NOT NULL,
    "organizerName" TEXT NOT NULL,
    "organizerContact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "registrationDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "public"."Event"("status");

-- CreateIndex
CREATE INDEX "Event_creatorId_idx" ON "public"."Event"("creatorId");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."userInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "public"."DemoBooking" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoBooking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DemoBooking" ADD CONSTRAINT "DemoBooking_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "public"."ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DemoBooking" ADD CONSTRAINT "DemoBooking_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "public"."Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

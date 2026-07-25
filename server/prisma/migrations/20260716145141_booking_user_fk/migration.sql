/*
  Warnings:

  - The `userId` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "public"."Booking"("userId");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."userInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

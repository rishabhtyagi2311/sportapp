/*
  Warnings:

  - Added the required column `partnerId` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Venue" ADD COLUMN     "partnerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."PartnerIdentity" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerIdentity_contactNumber_key" ON "public"."PartnerIdentity"("contactNumber");

-- AddForeignKey
ALTER TABLE "public"."Venue" ADD CONSTRAINT "Venue_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."PartnerIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

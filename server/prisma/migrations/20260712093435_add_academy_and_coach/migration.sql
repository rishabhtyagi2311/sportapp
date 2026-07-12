-- CreateTable
CREATE TABLE "public"."Academy" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "academyName" TEXT NOT NULL,
    "sportType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "coachName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "facilities" TEXT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "feeStructure" TEXT NOT NULL DEFAULT 'Monthly',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Academy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Coach" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "experience" TEXT,
    "contact" TEXT,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Academy" ADD CONSTRAINT "Academy_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."PartnerIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Coach" ADD CONSTRAINT "Coach_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "public"."Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

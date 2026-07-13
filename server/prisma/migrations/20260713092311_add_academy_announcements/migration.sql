-- CreateTable
CREATE TABLE "public"."Announcement" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_academyId_createdAt_idx" ON "public"."Announcement"("academyId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "public"."Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

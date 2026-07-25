-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "childProfileId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "public"."ChildProfile" (
    "id" TEXT NOT NULL,
    "parentId" INTEGER NOT NULL,
    "childName" TEXT NOT NULL,
    "childAge" INTEGER NOT NULL,
    "motherName" TEXT,
    "fatherName" TEXT NOT NULL,
    "fatherContact" TEXT,
    "address" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChildProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "public"."ChildProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChildProfile" ADD CONSTRAINT "ChildProfile_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."userInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

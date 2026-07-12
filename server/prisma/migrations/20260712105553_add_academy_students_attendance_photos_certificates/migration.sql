-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "fatherName" TEXT NOT NULL,
    "fatherContact" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AttendanceRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "present" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AcademyPhoto" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certificate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "academyName" TEXT NOT NULL,
    "achievement" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateNumber" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_studentId_date_key" ON "public"."AttendanceRecord"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "public"."Certificate"("certificateNumber");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "public"."Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademyPhoto" ADD CONSTRAINT "AcademyPhoto_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "public"."Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

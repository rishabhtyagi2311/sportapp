-- CreateTable
CREATE TABLE "public"."userInfo" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."footballProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footballProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."footballTeam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footballTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."footballTeamMember" (
    "id" SERIAL NOT NULL,
    "footballProfileId" INTEGER NOT NULL,
    "footballTeamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footballTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userInfo_email_key" ON "public"."userInfo"("email");

-- CreateIndex
CREATE UNIQUE INDEX "userInfo_contact_key" ON "public"."userInfo"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "footballProfile_userId_key" ON "public"."footballProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "footballTeamMember_footballProfileId_footballTeamId_key" ON "public"."footballTeamMember"("footballProfileId", "footballTeamId");

-- AddForeignKey
ALTER TABLE "public"."footballProfile" ADD CONSTRAINT "footballProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."userInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."footballTeam" ADD CONSTRAINT "footballTeam_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."footballProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."footballTeamMember" ADD CONSTRAINT "footballTeamMember_footballProfileId_fkey" FOREIGN KEY ("footballProfileId") REFERENCES "public"."footballProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."footballTeamMember" ADD CONSTRAINT "footballTeamMember_footballTeamId_fkey" FOREIGN KEY ("footballTeamId") REFERENCES "public"."footballTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

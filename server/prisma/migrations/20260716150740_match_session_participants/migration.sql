-- CreateTable
CREATE TABLE "public"."MatchSessionParticipant" (
    "id" TEXT NOT NULL,
    "matchSessionId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'joined',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchSessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchSessionParticipant_matchSessionId_idx" ON "public"."MatchSessionParticipant"("matchSessionId");

-- CreateIndex
CREATE INDEX "MatchSessionParticipant_userId_idx" ON "public"."MatchSessionParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchSessionParticipant_matchSessionId_userId_key" ON "public"."MatchSessionParticipant"("matchSessionId", "userId");

-- AddForeignKey
ALTER TABLE "public"."MatchSessionParticipant" ADD CONSTRAINT "MatchSessionParticipant_matchSessionId_fkey" FOREIGN KEY ("matchSessionId") REFERENCES "public"."MatchSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchSessionParticipant" ADD CONSTRAINT "MatchSessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."userInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

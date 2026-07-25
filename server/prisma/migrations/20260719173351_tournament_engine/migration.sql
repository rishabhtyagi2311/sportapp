-- CreateTable
CREATE TABLE "public"."Tournament" (
    "id" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "format" TEXT NOT NULL,
    "teamCount" INTEGER NOT NULL,
    "matchesPerPair" INTEGER DEFAULT 1,
    "extraTimeAllowed" BOOLEAN NOT NULL DEFAULT false,
    "playersPerTeam" INTEGER NOT NULL,
    "allowedSubs" INTEGER NOT NULL,
    "venueName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TournamentEntry" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "groupName" TEXT,
    "seed" INTEGER,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "TournamentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TournamentFixture" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "groupName" TEXT,
    "homeTeamId" INTEGER,
    "awayTeamId" INTEGER,
    "nextFixtureId" TEXT,
    "matchId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentFixture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "public"."Tournament"("status");

-- CreateIndex
CREATE INDEX "TournamentEntry_tournamentId_idx" ON "public"."TournamentEntry"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentEntry_tournamentId_teamId_key" ON "public"."TournamentEntry"("tournamentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentFixture_nextFixtureId_key" ON "public"."TournamentFixture"("nextFixtureId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentFixture_matchId_key" ON "public"."TournamentFixture"("matchId");

-- CreateIndex
CREATE INDEX "TournamentFixture_tournamentId_idx" ON "public"."TournamentFixture"("tournamentId");

-- AddForeignKey
ALTER TABLE "public"."Tournament" ADD CONSTRAINT "Tournament_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."userInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentEntry" ADD CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "public"."Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentEntry" ADD CONSTRAINT "TournamentEntry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."footballTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentFixture" ADD CONSTRAINT "TournamentFixture_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "public"."Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentFixture" ADD CONSTRAINT "TournamentFixture_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "public"."footballTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentFixture" ADD CONSTRAINT "TournamentFixture_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "public"."footballTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentFixture" ADD CONSTRAINT "TournamentFixture_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentFixture" ADD CONSTRAINT "TournamentFixture_nextFixtureId_fkey" FOREIGN KEY ("nextFixtureId") REFERENCES "public"."TournamentFixture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Football broadcasting feature, phase 1+2: let a match be created ahead of
-- kickoff (teams + date/venue only, lineup/settings deferred), and let a
-- tournament organizer set a per-fixture date/venue before that fixture's
-- match is created.

-- AlterTable: Match — relax lineup/settings fields to nullable so a match
-- can exist in 'scheduled' status without them, and add the scheduled
-- kickoff timestamp. All relaxations are additive/safe for existing rows
-- (every existing Match already has these fields populated).
ALTER TABLE "Match" ALTER COLUMN "playersPerTeam" DROP NOT NULL;
ALTER TABLE "Match" ALTER COLUMN "allowedSubs" DROP NOT NULL;
ALTER TABLE "Match" ALTER COLUMN "duration" DROP NOT NULL;
ALTER TABLE "Match" ALTER COLUMN "homeRoster" DROP NOT NULL;
ALTER TABLE "Match" ALTER COLUMN "awayRoster" DROP NOT NULL;
ALTER TABLE "Match" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable: TournamentFixture — per-fixture schedule override.
ALTER TABLE "TournamentFixture" ADD COLUMN     "scheduledAt" TIMESTAMP(3);
ALTER TABLE "TournamentFixture" ADD COLUMN     "venueName" TEXT;

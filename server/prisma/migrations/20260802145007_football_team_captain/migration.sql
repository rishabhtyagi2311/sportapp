-- AlterTable
ALTER TABLE "footballTeam" ADD COLUMN     "captainId" INTEGER;

-- Backfill: every existing team's captain defaults to its creator, matching
-- the pre-existing client-computed behavior (captain === createdBy) so no
-- team silently loses a captain when this column is introduced.
UPDATE "footballTeam" SET "captainId" = "createdById" WHERE "captainId" IS NULL;

-- AddForeignKey
ALTER TABLE "footballTeam" ADD CONSTRAINT "footballTeam_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "footballProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: teams created before this fix never added their creator as a
-- footballTeamMember row (the bug this migration's app-layer fix addresses).
-- Retroactively add them so existing teams aren't missing their own creator
-- from the roster. Safe against the (footballProfileId, footballTeamId)
-- unique constraint for any team that already happens to include them.
INSERT INTO "footballTeamMember" ("footballProfileId", "footballTeamId", "createdAt", "updatedAt")
SELECT "createdById", "id", NOW(), NOW()
FROM "footballTeam"
ON CONFLICT ("footballProfileId", "footballTeamId") DO NOTHING;

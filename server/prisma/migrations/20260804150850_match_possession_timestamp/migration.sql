-- Replace the client-fed "elapsed seconds" baseline with a server wall-clock
-- timestamp. currentPossessionTeamId + possessionStartedAt both set means
-- that team is actively accruing; possessionStartedAt null (with
-- currentPossessionTeamId still set) means paused/not currently accruing.
-- Any match live mid-possession-tracking at migration time lands in the
-- "paused" state below (safe fallback — no background time gets awarded).
ALTER TABLE "Match" DROP COLUMN "lastPossessionChangeSeconds";
ALTER TABLE "Match" ADD COLUMN     "possessionStartedAt" TIMESTAMP(3);

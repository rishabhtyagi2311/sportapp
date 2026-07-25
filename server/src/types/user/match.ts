import { z } from "zod";

export const rosterSchema = z.object({
  startingXI: z.array(z.number().int().positive()).min(1),
  bench: z.array(z.number().int().positive()).default([]),
  captainId: z.number().int().positive(),
  subsUsed: z.number().int().nonnegative().default(0),
});

export const createMatchSchema = z.object({
  homeTeamId: z.number().int().positive(),
  awayTeamId: z.number().int().positive(),
  venueName: z.string().optional(),
  playersPerTeam: z.number().int().positive(),
  allowedSubs: z.number().int().nonnegative(),
  extraTimeAllowed: z.boolean().default(false),
  duration: z.number().int().positive(),
  homeRoster: rosterSchema,
  awayRoster: rosterSchema,
  referees: z.array(z.string()).default([]),
});

export const addMatchEventSchema = z.object({
  teamId: z.number().int().positive(),
  playerId: z.number().int().positive().optional(),
  relatedPlayerId: z.number().int().positive().optional(),
  // 'goal'/'own_goal' affect the score; 'yellow_card'/'red_card'/'substitution' affect
  // end-of-match player stats (see MatchService.endMatch); anything else (offside, foul,
  // corner, save, ...) is stored as a purely informational timeline entry.
  eventType: z.string().min(1),
  eventSubType: z.string().optional(),
  minute: z.number().int().nonnegative(),
  seconds: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
});

export const updatePossessionSchema = z.object({
  teamId: z.number().int().positive(),
  currentSeconds: z.number().int().nonnegative(),
});

export const endMatchSchema = z.object({
  penaltyHomeScore: z.number().int().nonnegative().optional(),
  penaltyAwayScore: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

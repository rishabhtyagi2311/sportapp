import { z } from "zod";
import { rosterSchema } from "./match";

export const createTournamentSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    format: z.enum(["league", "knockout"]),
    teamIds: z.array(z.number().int().positive()).min(2),
    matchesPerPair: z.number().int().positive().optional(),
    extraTimeAllowed: z.boolean().default(false),
    playersPerTeam: z.number().int().positive(),
    allowedSubs: z.number().int().nonnegative(),
    venueName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.format !== "knockout") return true;
      const n = data.teamIds.length;
      return n >= 2 && (n & (n - 1)) === 0;
    },
    { message: "Knockout tournaments require a power-of-2 number of teams (2, 4, 8, 16, ...)" }
  );

export const startFixtureMatchSchema = z.object({
  duration: z.number().int().positive(),
  homeRoster: rosterSchema,
  awayRoster: rosterSchema,
  referees: z.array(z.string()).default([]),
});

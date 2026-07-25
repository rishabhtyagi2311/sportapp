import { z } from "zod";

export const footballProfileRegisterSchema = z.object({
  role: z.string().min(1),
  nickname: z.string().min(1),
  experience: z.string().min(1),
});

export const footballTeamCreateSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  maxPlayers: z.number().int().positive(),
  playerIds: z.array(z.number().int().positive()).default([]),
});

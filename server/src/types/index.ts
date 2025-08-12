import { z } from "zod";

export const basicOnboardingInfo = z.object({
    firstname: z.string(),
    lastname : z.string(),
    dob: z.string(),
    contact : z.string(),
    city: z.string(),
    email: z.string().email()
    


})

export const footballProfileRegister = z.object({
    userId : z.number(),
    role : z.string(),
    experience : z.string(),
    nickname: z.string()
})


export const footballTeamCreate = z.object({
    name: z.string(),
    location: z.string(),
    createdByUserId: z.number(),
    maxPlayers : z.number(),
    playerIds: z.array(z.number())
})

export const createfootballMatchBaseSchema = z.object({
    location: z.string(),
  playersPerTeam: z.number(),
  allowedSubs: z.number(),
  extraTime: z.boolean(),
  homeTeamId: z.number(),
  awayTeamId: z.number(),
  referees: z.array(z.string()),
  });
import { z } from 'zod';

export const MatchStatus = z.enum(['scheduled', 'in_progress', 'finished', 'postponed', 'canceled']);

export const MatchSchema = z.object({
  tffMatchId: z.number(),
  season: z.string(),
  round: z.string().nullable(),
  dateUtc: z.string().nullable(),
  homeTeam: z.object({ tffTeamId: z.number(), name: z.string() }),
  awayTeam: z.object({ tffTeamId: z.number(), name: z.string() }),
  venue: z.string().nullable(),
  status: MatchStatus,
  score: z
    .object({ home: z.number().nullable(), away: z.number().nullable() })
    .nullable(),
});

export type Match = z.infer<typeof MatchSchema>;



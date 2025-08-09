import { z } from 'zod';

export const TeamSchema = z.object({
  tffTeamId: z.number(),
  name: z.string(),
  slug: z.string(),
});

export type Team = z.infer<typeof TeamSchema>;



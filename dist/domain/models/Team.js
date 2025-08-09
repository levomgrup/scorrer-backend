import { z } from 'zod';
export const TeamSchema = z.object({
    tffTeamId: z.number(),
    name: z.string(),
    slug: z.string(),
});

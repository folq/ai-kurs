import { z } from "zod";

export const postFavoriteBodySchema = z.object({
  movieId: z.coerce.number().int().positive(),
  note: z.union([z.string(), z.null()]).optional(),
});

export const embeddingsSearchBodySchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(10),
});

/** Dynamic route segment `pages/api/.../[id].ts` */
export const pagesMovieIdQuerySchema = z.object({
  id: z.coerce.number().int().positive(),
});

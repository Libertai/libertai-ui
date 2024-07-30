import { z } from 'zod';

export const knowledgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  documents: z.array(z.any()),
  lastUpdatedAt: z.string().datetime(),
});
export type KnowledgeBase = z.infer<typeof knowledgeSchema>;

export const knowledgeAlephStorage = z.object({ data: z.array(knowledgeSchema) });

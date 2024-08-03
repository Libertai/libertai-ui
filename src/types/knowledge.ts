import { z } from 'zod';

const knowledgeDocumentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  content: z.string(),
  size: z.number(),
  store: z.object({
    item_hash: z.string(),
    ipfs_hash: z.string(),
  }),
});
export type KnowledgeDocument = z.infer<typeof knowledgeDocumentSchema>;

export const knowledgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  documents: z.array(knowledgeDocumentSchema),
  lastUpdatedAt: z.string().datetime(),
});
export type KnowledgeBase = z.infer<typeof knowledgeSchema>;

export const knowledgeBaseIdentifierSchema = z.object({
  id: z.string().uuid(),
  post_hash: z.string(),
  encryption: z.object({
    key: z.string(),
    iv: z.string(),
  }),
});

export type KnowledgeBaseIdentifier = z.infer<typeof knowledgeBaseIdentifierSchema>;

export const knowledgeBaseIdentifiersAlephStorage = z.object({ data: z.array(knowledgeBaseIdentifierSchema) });

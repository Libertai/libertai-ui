import { z } from 'zod';

export type KnowledgeSearchResult = {
  content: string;
  distance: number;
};

const knowledgeDocumentChunk = z.object({
  content: z.string(),
  vector: z.array(z.number()).optional(), // TODO: remove optional once issue fixed with Justin C.
});

export type KnowledgeDocumentChunk = z.infer<typeof knowledgeDocumentChunk>;

const knowledgeDocumentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  chunks: z.array(knowledgeDocumentChunk),
  size: z.number(),
  path: z.string(),
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

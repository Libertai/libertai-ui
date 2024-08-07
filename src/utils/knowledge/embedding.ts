import axios from 'axios';
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { KnowledgeDocument, KnowledgeDocumentChunk, KnowledgeSearchResult } from 'src/types/knowledge';
import { distance } from 'ml-distance';

const DEFAULT_EMBEDDING_API_URL =
  'https://curated.aleph.cloud/vm/ee1b2a8e5bd645447739d8b234ef495c9a2b4d0b98317d510a3ccf822808ebe5/embedding';

export const generateChunks = async (
  fileType: string,
  content: string,
  chunkSize: number = 500,
  chunkOverlap: number = 100,
): Promise<KnowledgeDocumentChunk[]> => {
  const splitter = getTextSplitter(fileType, chunkSize, chunkOverlap);

  // Split into a list of LangChain documents
  const documentChunks = await splitter.createDocuments(
    [content],
    // TODO: include metadata ?
    [],
    {
      appendChunkOverlapHeader: false,
    },
  );
  const result: KnowledgeDocumentChunk[] = [];

  // Need to do this synchronously to avoid timeout on the embedding model API
  for (const chunk of documentChunks) {
    const embedding_vector = await embed(chunk.pageContent);
    result.push({
      content: chunk.pageContent,
      vector: embedding_vector,
    });
  }

  return result;
};

const getTextSplitter = (
  fileType: string,
  chunkSize: number,
  chunkOverlap: number,
): MarkdownTextSplitter | RecursiveCharacterTextSplitter => {
  switch (fileType) {
    case 'text/markdown':
      return new MarkdownTextSplitter();
    default:
      return new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
        separators: ['\n\n---\n\n', '\n\n', '\n', ' '],
      });
  }
};

export const searchDocuments = async (
  query: string,
  documents: KnowledgeDocument[],
  max_chunks = 5,
  max_distance = 15,
): Promise<KnowledgeSearchResult[]> => {
  const query_vector = await embed(query);
  const matches: KnowledgeSearchResult[] = [];

  // Iterate over all embeddings
  documents.forEach((document) => {
    document.chunks.forEach((chunk) => {
      const euclidean_distance = distance.euclidean(query_vector, chunk.vector);

      // If the distance is greater than the max_distance, skip it
      if (euclidean_distance > max_distance) return;
      matches.push({ content: chunk.content, distance: euclidean_distance });
    });
  });

  matches.sort((a, b) => a.distance - b.distance);

  return matches.slice(0, max_chunks);
};

async function embed(content: string): Promise<number[]> {
  const tries = 3;
  const timeout = 1000;

  const errors = [];
  for (let i = 0; i < tries; i++) {
    try {
      const response = await axios.post<{ embedding: number[] }>(DEFAULT_EMBEDDING_API_URL, {
        content,
      });

      return response.data.embedding;
    } catch (error) {
      errors.push(error);
      console.error(`Error embedding text: ${error}`);
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }
  return [];
}

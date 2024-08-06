import axios from 'axios';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { KnowledgeDocumentChunk } from 'src/types/knowledge';

const DEFAULT_EMBEDDING_API_URL =
  'https://curated.aleph.cloud/vm/ee1b2a8e5bd645447739d8b234ef495c9a2b4d0b98317d510a3ccf822808ebe5/embedding';

export const generateChunks = async (
  title: string,
  content: string,
  chunkSize = 500,
  overlapSize = 100,
): Promise<KnowledgeDocumentChunk[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: overlapSize,
    separators: ['\n\n---\n\n', '\n\n', '\n', ' '],
  });

  // Split into a list of LangChain documents
  const documents = await splitter.createDocuments(
    [content],
    // TODO: include metadata
    [],
    {
      chunkHeader: `DOCUMENT TITLE: ${title}\n\n---\n\n`,
      appendChunkOverlapHeader: true,
    },
  );
  return await Promise.all(
    documents.map(
      async (d): Promise<KnowledgeDocumentChunk> => ({
        content: d.pageContent,
        vector: await embed(d.pageContent),
      }),
    ),
  );
};

async function embed(content: string): Promise<number[]> {
  const tries = 3;
  let timeout = 1000;

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
      timeout *= 2;
    }
  }
  return [];
}

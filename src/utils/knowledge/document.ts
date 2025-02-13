import { KnowledgeDocument } from 'src/types/knowledge';
import { generateChunks } from 'src/utils/knowledge/embedding';
import { extractFileContent } from 'src/utils/knowledge/parsing';
import { v4 as uuidv4 } from 'uuid';

export const processDocument = async (file: File): Promise<Omit<KnowledgeDocument, 'store'>> => {
  const fileInfo = await extractFileContent(file);

  const chunks = await generateChunks(fileInfo.type, fileInfo.content);

  return { ...fileInfo, id: uuidv4(), name: file.name, size: file.size, chunks, path: '/' };
};

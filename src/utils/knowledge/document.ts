import { v4 as uuidv4 } from 'uuid';

import { KnowledgeDocument } from 'src/types/knowledge';
import { extractFileContent } from 'src/utils/knowledge/parsing';

export const processDocument = async (file: File): Promise<Omit<KnowledgeDocument, 'store_hash'>> => {
  const fileInfo = await extractFileContent(file);

  return { ...fileInfo, id: uuidv4(), name: file.name, size: file.size };
};

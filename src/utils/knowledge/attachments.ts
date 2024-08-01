import { v4 as uuidv4 } from 'uuid';
import { MessageAttachment } from 'src/types/chats';
import { extractFileContent } from 'src/utils/knowledge/parsing';

export const processAttachment = async (file: File): Promise<MessageAttachment> => {
  const title = file.name;
  const fileInfo = await extractFileContent(file);

  if (fileInfo.content.length > 4 * 1024) {
    // File is too big to be inlined, rejecting it.
    // Later we'll use a knowledge db to fix this.
    throw new Error('File is too big, please use a file of 4 KB of content or less.');
  }

  return { title, content: fileInfo.content, type: fileInfo.content, id: uuidv4() };
};

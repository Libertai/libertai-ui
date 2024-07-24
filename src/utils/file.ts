import { v4 as uuidv4 } from 'uuid';
import { MessageAttachment } from 'src/types/chats';

export const processFile = async (file: File): Promise<MessageAttachment> => {
  const title = file.name;
  let extractedText = '';
  const type = file.type;

  try {
    switch (file.type) {
      case 'text/markdown':
      case 'text/plain':
        extractedText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target!.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsText(file);
        });
        break;
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }

  return { title, content: extractedText, type, id: uuidv4() };
};

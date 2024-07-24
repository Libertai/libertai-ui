import { v4 as uuidv4 } from 'uuid';
import { MessageAttachment } from 'src/types/chats';
import * as pdfjs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import mime from 'mime';
// @ts-expect-error
import workerSrc from 'pdfjs-dist/build/pdf.worker?worker&url';

export const processFile = async (file: File): Promise<MessageAttachment> => {
  const title = file.name;
  let extractedText = '';
  const type = mime.getType(file.name) ?? file.type;

  try {
    switch (type) {
      case 'application/pdf':
        extractedText = await extractTextFromPdfFile(file);
        break;
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

  // TODO: throw error if file is too big

  return { title, content: extractedText, type, id: uuidv4() };
};

const extractTextFromPdfFile = async (file: File): Promise<string> => {
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  const pdfUrl = URL.createObjectURL(file);

  try {
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    const maxPages = pdf.numPages;
    const textContent: string[] = [];

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageTextContent = content.items.map((item) => (item as TextItem).str).join(' ');
      textContent.push(pageTextContent);
    }
    return textContent.join('');
  } catch (error) {
    console.error(`Error fetching PDF content from ${file.name}`);
    throw error;
  }
};

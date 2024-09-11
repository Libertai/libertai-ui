import * as pdfjs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

export const supportedInputFiles = ['.txt', '.md', '.markdown', '.pdf'].join(',');

const extractTextFromPdfFile = async (file: File): Promise<string> => {
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

export const extractFileContent = async (file: File): Promise<{ type: string; content: string }> => {
  let extractedText = '';
  const fileType = file.name.split('.').pop();

  try {
    switch (fileType) {
      case 'pdf':
        extractedText = await extractTextFromPdfFile(file);
        break;
      case 'markdown':
      case 'md':
      case 'txt':
        extractedText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target!.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsText(file);
        });
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }

  return { content: extractedText, type: fileType };
};

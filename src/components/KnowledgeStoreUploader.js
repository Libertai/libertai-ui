import { createUploaderComponent } from 'quasar';
import { computed, ref } from 'vue';

import { chatTag } from 'src/utils/chat';

// State
import { useKnowledgeStore } from 'src/stores/knowledge-store';

// Get PDF.js from the window object
const pdfjsLib = window.pdfjsLib;

export default createUploaderComponent({
  name: 'KnowledgeStoreUploader',
  props: {
    chatRef: {
      type: Object,
      required: true,
    },
  },
  emits: ['attachment-added'],
  injectPlugin({ props, emit, helpers }) {
    const loading = ref(false);
    const chatId = props.chatRef.id;

    // Map of file objects to their status as either 'queued', 'uploading', 'embedding', 'uploaded', or 'failed'
    const fileStatus = ref({});

    // Upload Logic
    // TODO: we should be feeding the chat id through here, not through props
    //  We're gonna need a way to add more custom tags to the documents
    async function upload(_args) {
      // Set the loading state
      loading.value = true;
      const files = helpers.queuedFiles.value;
      console.log(`components::KnowledgeStoreUploader::upload - files: ${files}`);
      fileStatus.value = {};
      fileStatus.value = files.reduce((acc, file) => {
        acc[file.name] = 'queued';
        return acc;
      });

      // Load our state
      const knowledgeStore = useKnowledgeStore();

      let uploads = [];
      // TODO: workers would be preferred here
      // Handle Each File in Sequence
      for (let file of files) {
        let result = async () => {
          try {
            fileStatus.value[file.name] = 'uploading';
            helpers.updateFileStatus(file, 'uploading');
            let { title, text, type } = await processFile(file);
            // Check how big the file is
            // If the text is less than 4 KiB, then just inline it
            if (text.length < 4 * 1024) {
              fileStatus.value[file.name] = 'uploaded';
              helpers.updateFileStatus(file, 'uploaded');
              // If you don't embed the document, make sure to set the content
              emit('attachment-added', { title, type, content: text });
              return;
            }

            // Embed the document
            fileStatus.value[file.name] = 'embedding';
            helpers.updateFileStatus(file, 'embedding');
            let tag = chatTag(chatId);
            let { id } = await knowledgeStore.addDocument(title, text, [tag]);
            let documentId = id;
            fileStatus.value[file.name] = 'uploaded';
            helpers.updateFileStatus(file, 'uploaded');
            emit('attachment-added', { title, documentId, type });
          } catch (error) {
            console.error(error);
            fileStatus.value[file.name] = 'failed';
            helpers.updateFileStatus(file, 'failed');
            console.error(`components::KnowledgeStoreUploader::upload - error: ${error}`);
          }
        };
        uploads.push(result());
      }
      // Resolve all uploads
      await Promise.all(uploads);
      // Reset the loading state
      loading.value = false;
    }

    const isUploading = computed(() => {
      // return <Boolean>
      return loading.value;
    });

    const isBusy = computed(() => {
      // return <Boolean>
      return loading.value;
    });

    function abort() {
      fileStatus.value = {};
    }

    /**
     * Extract title and text content from a file.
     * Supports PDF and plain text files.
     * @param {File} file - The file to process.
     * @returns {Promise<{ title: string; text: string }>} - The extracted title and text content.
     */
    async function processFile(file) {
      const title = file.name;
      let extractedText = '';
      let type = file.type;

      try {
        switch (file.type) {
          case 'application/pdf':
            extractedText = await extractTextFromPdfFile(file);
            break;
          case 'text/plain':
            extractedText = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => resolve(event.target.result);
              reader.onerror = (error) => reject(error);
              reader.readAsText(file);
            });
            break;
          case 'text/markdown':
            extractedText = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => resolve(event.target.result);
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

      return { title, text: extractedText, type };
    }

    /**
     * Extract text from a PDF file
     * @param {File} file
     * @returns {Promise<string>}
     */
    async function extractTextFromPdfFile(file) {
      const pdfUrl = URL.createObjectURL(file);

      let pdf;
      try {
        pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      } catch (error) {
        console.error(`components::KnowledgeStoreUploader::extractTextFromPdfFile - error: ${error}`);
        throw new Error('Failed to extract text from PDF');
      }
      const maxPages = pdf.numPages;
      let textContent = [];

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageTextContent = content.items.map((item) => item.str).join(' ');
        textContent.push(pageTextContent);
      }
      return textContent.join('');
    }

    return {
      isUploading,
      isBusy,
      abort,
      upload,
    };
  },
});

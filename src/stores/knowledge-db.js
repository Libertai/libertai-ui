import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

import { embed, chunkText } from '../utils/embed';

const KNOWLEDGE_DB_KEY = 'knowledge-db';
const KNOWLEDGE_DB_DOCUMENTS_KEY = 'knowledge-db-documents';
const KNOWLEDGE_DB_EMBEDDINGS_KEY = 'knowledge-db-embeddings';

export const useKnowledgeDBStore = defineStore(KNOWLEDGE_DB_KEY, {
  state: () => ({
    documents: [],
    embeddings: []
  }),
  actions: {
    async loadFromStorage() {
      try {
        let documents = localStorage.getItem(KNOWLEDGE_DB_DOCUMENTS_KEY);
        let embeddings = localStorage.getItem(KNOWLEDGE_DB_EMBEDDINGS_KEY);
        if (documents) {
          this.documents = JSON.parse(documents);
        }
        if (embeddings) {
          this.embeddings = JSON.parse(embeddings);
        }
      } catch (error) {
        console.error('Error initializing knowledgeDB:', error);
      }
    },
    async addDocument(title, content) {
      // Add our new document
      let id = uuidv4();
      let document = {
        id, title, content
      }
      this.documents.push(document);

      // Generate our embeddings
      let chunks = chunkText(document.content);
      console.log("Chunks: ", chunks);
      let promises = []
      for (let chunk of chunks) {
        promises.push(async function() {
          let id = uuidv4();
          let e = await embed(chunk);
          let embedding = { id, document_id: document.id, content: chunk, embedging: e };
          console.log("Embed: ", embedding);
          return embedding;
        }());
      }
      let embeddings = await Promise.all(promises);
      this.embeddings.push(embeddings);
      console.log("Generated embeddings: ", embeddings);

      // Done!
      this.saveToStorage();
    },
    async searchEmbeddings(query, num_results=5) {
      let query_embedding = await embed(query);
      // Iterate over all all embeddings 
      // Return the top `num_results` closest matches
      // TODO:
    },

    saveToStorage() {
      try {
        localStorage.setItem(KNOWLEDGE_DB_DOCUMENTS_KEY, JSON.stringify(this.documents));
        localStorage.setItem(KNOWLEDGE_DB_EMBEDDINGS_KEY, JSON.stringify(this.embeddings));
      } catch (error) {
        console.error('Error saving knowledgeDB to local storage:', error);
      }
    },
  },
});

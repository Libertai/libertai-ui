import { defineStore } from 'pinia';
import { KnowledgeStore } from '@libertai/libertai-js';
import { defaultKnowledge } from '../utils/knowledge';

export const KNOWLEDGE_STORE_PINIA_KEY = 'knowledge-store-pinia-key';

export const useKnowledgeStore = defineStore(KNOWLEDGE_STORE_PINIA_KEY, {
  state: () => ({
    documents: [],
    knowledgeStore: new KnowledgeStore(),
  }),
  actions: {
    async load() {
      await this.knowledgeStore.load();
      let defaultDocumentTitles = defaultKnowledge.map((doc) => doc.title);
      const docs = Array.from(this.knowledgeStore.documents.values());
      let documentTitles = docs.map((doc) => doc.title);
      // Check if default documents are already in the store
      let missingDocuments = defaultDocumentTitles.filter((title) => !documentTitles.includes(title));
      // Add missing documents
      let addedDocuments = [];
      for (let title of missingDocuments) {
        let doc = defaultKnowledge.find((doc) => doc.title === title);
        addedDocuments.push(this.addDocument(doc.title, doc.content, doc.tags));
        docs.push(doc);
      }
      await Promise.all(addedDocuments);
      console.log('stores::knowledge-store::load', docs);
      this.documents = docs;
      return;
    },
    async addDocument(title, content, tags = []) {
      let doc = await this.knowledgeStore.addDocument(title, content, tags);
      this.documents.push(doc);
    },
    async removeDocument(documentId) {
      await this.knowledgeStore.removeDocument(documentId);
      this.documents = this.documents.filter((doc) => doc.id !== documentId);
    },
    async searchDocuments(query, tags = []) {
      return await this.knowledgeStore.searchDocuments(query, 3, 20, tags);
    },
  },
});

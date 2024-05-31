import { defineStore } from 'pinia';
import { KnowledgeStore } from '@libertai/libertai-js';
import { defaultKnowledge } from '../utils/knowledge';

export const DEFAULT_KNOWLEDGE_TAG = 'default';
export const KNOWLEDGE_STORE_PINIA_KEY = 'knowledge-store-pinia-key';

export const useKnowledgeStore = defineStore(KNOWLEDGE_STORE_PINIA_KEY, {
  state: () => ({
    documents: [],
    knowledgeStore: new KnowledgeStore(),
  }),
  actions: {
    async load() {
      await this.knowledgeStore.load();
      await this.knowledgeStore.prune();
      let defaultDocumentTitles = defaultKnowledge.map((doc) => doc.title);
      const docs = Array.from(this.knowledgeStore.documents.values());
      let documentTitles = docs.map((doc) => doc.title);
      // Check if default documents are already in the store
      let missingDocuments = defaultDocumentTitles.filter((title) => !documentTitles.includes(title));
      // Add missing documents
      let addedDocuments = [];
      for (let title of missingDocuments) {
        let doc = defaultKnowledge.find((doc) => doc.title === title);
        let tags = doc.tags ? doc.tags : [];
        tags.push(DEFAULT_KNOWLEDGE_TAG);
        addedDocuments.push(this.addDocument(doc.title, doc.content, tags));
        docs.push(doc);
      }
      await Promise.all(addedDocuments);
      this.documents = docs;
    },
    async addDocument(title, content, tags = []) {
      let doc = await this.knowledgeStore.addDocument(title, content, tags);
      this.documents.push(doc);
      return doc;
    },
    async removeDocument(documentId) {
      await this.knowledgeStore.removeDocument(documentId);
      this.documents = this.documents.filter((doc) => doc.id !== documentId);
    },
    async searchDocuments(query, tags = []) {
      // If tags aren't empty, add the default tag
      //  Otherwise, if tags is empty, we'll just search
      //   with no filters, and the default tag will be included
      if (tags.length > 0) {
        tags.push(DEFAULT_KNOWLEDGE_TAG);
      }

      // TODO: this should probably be none
      return await this.knowledgeStore.searchDocuments(query, 3, 20, tags);
    },
  },
});

import { defineStore } from "pinia";
import { KnowledgeStore } from "@libertai/libertai-js";
import { defaultKnowledge } from "../utils/knowledge";

export const KNOWLEDGE_STORE_PINIA_KEY = "knowledge-store-pinia-key";

export const useKnowledgeStore = defineStore(KNOWLEDGE_STORE_PINIA_KEY, {
  state: () => ({
    knowledgeStore: new KnowledgeStore(),
  }),
  actions: {
    documents() {
      // Return all documents as a list
      let docs = [];
      for (const [_key, value] of this.knowledgeStore.documents) {
        docs.push(value);
      }
      return docs;
    },

    async load() {
      await this.knowledgeStore.load();
      let defaultDocumentTitles = defaultKnowledge.map((doc) => doc.title);
      let documentTitles = this.documents().map((doc) => doc.title);
      // Check if default documents are already in the store
      let missingDocuments = defaultDocumentTitles.filter(
        (title) => !documentTitles.includes(title),
      );
      // Add missing documents
      let addedDocuments = [];
      for (let title of missingDocuments) {
        let doc = defaultKnowledge.find((doc) => doc.title === title);
        addedDocuments.push(this.addDocument(doc.title, doc.content, doc.tags));
      }
      await Promise.all(addedDocuments);
      return;
    },
    async addDocument(title, content, tags = []) {
      return await this.knowledgeStore.addDocument(title, content, tags);
    },
    async searchDocuments(query, tags = []) {
      return await this.knowledgeStore.searchDocuments(query, 3, 18, tags);
    },
  },
});

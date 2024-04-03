import { defineStore } from "pinia";
import { KnowledgeStore } from "libertai-js";

export const KNOWLEDGE_STORE_PINIA_KEY = "knowledge-store-pinia-key";

export const useKnowledgeStore = defineStore(KNOWLEDGE_STORE_PINIA_KEY, {
  state: () => ({
    knowledgeStore: new KnowledgeStore(),
  }),
  actions: {
    documents() {
      return this.knowledgeStore.documents;
    },

    async load() {
      return await this.knowledgeStore.load();
    },
    async addDocument(title, content) {
      return await this.knowledgeStore.addDocument(title, content);
    },
    // TODO: probably horribly inefficient, but it works for now
    async searchDocuments(query) {
      return await this.knowledgeStore.searchDocuments(
        query,
        (k = 5),
        (max_distannce = 15),
      );
    },
  },
});

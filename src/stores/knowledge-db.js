import { defineStore } from "pinia";
import { KnowledgeDb } from "libertai-js";

export const KNOWLEDGE_DB_PINIA_KEY = "knowledgeDb-pinia-key";

export const useKnowledgeDBStore = defineStore(KNOWLEDGE_DB_PINIA_KEY, {
  state: () => ({
    knowledgeDb: new KnowledgeDb(),
  }),
  actions: {
    documents() {
      return this.knowledgeDb.documents;
    },

    async load() {
      return await this.knowledgeDb.load();
    },
    async addDocument(title, content) {
      return await this.knowledgeDb.addDocument(title, content);
    },
    // TODO: probably horribly inefficient, but it works for now
    async searchDocuments(query) {
      return await this.knowledgeDb.searchDocuments(query);
    },
  },
});

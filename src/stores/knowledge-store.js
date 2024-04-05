import { defineStore } from "pinia";
import { KnowledgeStore } from "libertai-js";
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
      console.log(
        "stores::knowledge-store::load | documents = %o",
        this.documents(),
      );
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
      console.log(
        "stores::knowledge-store::addDocument | title = %s | tags = %o",
        title,
        tags,
      );
      return await this.knowledgeStore.addDocument(title, content, tags);
    },
    async searchDocuments(query, tags = []) {
      console.log(
        "stores::knowledge-store::searchDocuments | query = %s | tags = %o",
        query,
        tags,
      );
      // For some reason js thinks this array is always empty
      // lets pull it apart to fix that
      return await this.knowledgeStore.searchDocuments(query, 5, 20, tags);
    },
  },
});

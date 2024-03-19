import { defineStore } from 'pinia';

export const useKnowledgeDBStore = defineStore({
  id: 'knowledgeDB',
  state: () => ({
    documents: [],
  }),
  actions: {
    async initialize() {
      try {
        this.documents = JSON.parse(localStorage.getItem('knowledgeDB')) || [];
      } catch (error) {
        console.error('Error initializing knowledgeDB store from local storage:', error);
      }
    },
    async addDocument({ title, content }) {
      const newDocument = { id: Date.now(), title, content };
      
      this.documents.push(newDocument);
      await this.saveToLocalStorage();
    },
    async updateDocument(id, updatedData) {
      const index = this.documents.findIndex((doc) => doc.id === id);
      if (index !== -1) {
        this.$patch({ documents: { [index]: updatedData } });
        await this.saveToLocalStorage();
      }
    },
    async saveToLocalStorage() {
      try {
        localStorage.setItem('knowledgeDB', JSON.stringify(this.documents));
      } catch (error) {
        console.error('Error saving knowledgeDB to local storage:', error);
      }
    },
  },
});

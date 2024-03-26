import { defineStore } from 'pinia';

export const useKnowledgeDBStore = defineStore('knowledgeDB', {
  state: () => ({
    documents: [],
  }),
  actions: {
    loadFromStorage() {
      try {
        let content = localStorage.getItem('knowledge-items');
        if (content) {
          this.documents = JSON.parse(content);
        }
        console.log(content)
      } catch (error) {
        console.error('Error initializing knowledgeDB store from local storage:', error);
      }
    },
    async addDocument(title, content) {
      console.log('Adding document:', title, content);
      const newDocument = { id: Date.now(), title, content };
      
      this.documents.push(newDocument);
      console.log(this.documents);
      this.saveToStorage();
      console.log(this.documents);
    },
    async updateDocument(id, updatedData) {
      const index = this.documents.findIndex((doc) => doc.id === id)
      if (index !== -1) {
        this.$patch({ documents: { [index]: updatedData } });
        this.saveToStorage();
      }
    },
    saveToStorage() {
      try {
        localStorage.setItem('knowledge-items', JSON.stringify(this.documents));
      } catch (error) {
        console.error('Error saving knowledgeDB to local storage:', error);
      }
    },
  },
});

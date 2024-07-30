import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

import { KnowledgeBase } from 'src/types/knowledge';
import { useAccountStore } from 'stores/account';

type KnowledgeStoreState = {
  knowledgeBases: KnowledgeBase[];
};

export const useKnowledgeStore = defineStore('knowledge', {
  state: (): KnowledgeStoreState => ({
    knowledgeBases: [],
  }),
  actions: {
    async load() {
      const { alephStorage } = useAccountStore();
      if (alephStorage === null) {
        return;
      }

      const knowledgeBases = await alephStorage.fetchKnowledgeBases();
      if (knowledgeBases === undefined) {
        return;
      }

      this.knowledgeBases = knowledgeBases;
    },

    async saveOnAleph() {
      const { alephStorage } = useAccountStore();
      if (alephStorage === null) {
        return;
      }

      await alephStorage.saveKnowledgeBases(this.knowledgeBases);
    },

    async createKnowledgeBase(name: string) {
      this.knowledgeBases.push({ id: uuidv4(), name, documents: [], lastUpdatedAt: new Date().toISOString() });

      await this.saveOnAleph();
    },
  },
});

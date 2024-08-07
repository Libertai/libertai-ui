import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

import { KnowledgeBase, KnowledgeBaseIdentifier, KnowledgeDocument } from 'src/types/knowledge';
import { useAccountStore } from 'stores/account';

type KnowledgeStoreState = {
  knowledgeBases: KnowledgeBase[];
  knowledgeBaseIdentifiers: KnowledgeBaseIdentifier[];
  isLoaded: boolean;
};

export const useKnowledgeStore = defineStore('knowledge', {
  state: (): KnowledgeStoreState => ({
    knowledgeBases: [],
    knowledgeBaseIdentifiers: [],
    isLoaded: false,
  }),
  getters: {
    getDocumentsFrom: (state) => {
      return (ids: string[]): KnowledgeDocument[] => {
        return state.knowledgeBases
          .filter((kb) => ids.includes(kb.id))
          .map((kb) => kb.documents)
          .flat();
      };
    },
  },
  actions: {
    async load() {
      const { alephStorage } = useAccountStore();
      if (alephStorage === null) {
        return;
      }

      const knowledgeBaseIdentifiers = await alephStorage.fetchKnowledgeBaseIdentifiers();
      this.knowledgeBaseIdentifiers = knowledgeBaseIdentifiers ?? [];

      const knowledgeBases = await Promise.all(
        this.knowledgeBaseIdentifiers.map(async (kbIdentifier): Promise<KnowledgeBase | undefined> => {
          return await alephStorage.fetchKnowledgeBase(
            kbIdentifier.post_hash,
            Buffer.from(kbIdentifier.encryption.key),
            Buffer.from(kbIdentifier.encryption.iv),
          );
        }),
      );
      this.knowledgeBases = knowledgeBases.filter((kb) => kb !== undefined);
      this.isLoaded = true;
    },

    async createKnowledgeBase(name: string) {
      const { alephStorage } = useAccountStore();
      if (alephStorage === null) {
        return;
      }

      const newKb: KnowledgeBase = { id: uuidv4(), name, documents: [], lastUpdatedAt: new Date().toISOString() };

      const kbIdentifier = await alephStorage.createKnowledgeBase(newKb, this.knowledgeBaseIdentifiers);
      if (kbIdentifier === undefined) {
        throw new Error('Knowledge base creation failed');
      }
      this.knowledgeBases.push(newKb);
      this.knowledgeBaseIdentifiers.push(kbIdentifier);
    },

    async updateKnowledgeBase(kb: KnowledgeBase, kbIdentifier: KnowledgeBaseIdentifier) {
      const { alephStorage } = useAccountStore();
      if (alephStorage === null) {
        return;
      }
      await alephStorage.updateKnowledgeBase(kb, kbIdentifier);

      this.knowledgeBases = this.knowledgeBases.map((knowledgeBase) => {
        if (knowledgeBase.id === kb.id) {
          return { ...kb, lastUpdatedAt: new Date().toISOString() };
        }
        return knowledgeBase;
      });
    },

    async deleteKnowledgeDocument(
      document: KnowledgeDocument,
      knowledgeBase: KnowledgeBase,
      kbIdentifier: KnowledgeBaseIdentifier,
      updateKnowledgeBase: boolean = true,
    ) {
      const { alephStorage } = useAccountStore();
      if (alephStorage === null) {
        return;
      }

      await alephStorage.deleteFile(document.store.item_hash);
      if (updateKnowledgeBase) {
        const newKnowledgeBase: KnowledgeBase = {
          ...knowledgeBase,
          documents: knowledgeBase.documents.filter((d) => d.id !== document.id),
        };
        await this.updateKnowledgeBase(newKnowledgeBase, kbIdentifier);
      }
    },

    async deleteKnowledgeBase(knowledgeBase: KnowledgeBase, kbIdentifier: KnowledgeBaseIdentifier): Promise<boolean> {
      const { alephStorage } = useAccountStore();
      if (alephStorage === null) {
        return false;
      }
      knowledgeBase.documents.forEach((document) => {
        this.deleteKnowledgeDocument(document, knowledgeBase, kbIdentifier, false);
      });

      const success = await alephStorage.deleteKnowledgeBase(kbIdentifier, this.knowledgeBaseIdentifiers);

      if (!success) {
        return success;
      }
      this.knowledgeBases = this.knowledgeBases.filter((kb) => kb.id !== knowledgeBase.id);
      this.knowledgeBaseIdentifiers = this.knowledgeBaseIdentifiers.filter((kbi) => kbi.id !== kbIdentifier.id);
      return success;
    },
  },
});

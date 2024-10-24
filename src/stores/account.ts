import { defineStore } from 'pinia';
import { AlephPersistentStorage } from 'src/utils/aleph-persistent-storage';
import { useSettingsStore } from 'stores/settings';
import { getAccount, getBalance } from '@wagmi/core';
import { config } from 'src/config/wagmi';
import { useTokensStore } from 'stores/tokens';
import { useKnowledgeStore } from 'stores/knowledge';
import { useSubscriptionStore } from 'stores/subscription';
import env from 'src/config/env';

const LTAI_BASE_ADDRESS = env.LTAI_BASE_ADDRESS as `0x${string}`;

type AccountStoreState = {
  alephStorage: AlephPersistentStorage | null;
  ltaiBalance: number;
};

export const useAccountStore = defineStore('account', {
  state: (): AccountStoreState => ({
    alephStorage: null,
    ltaiBalance: 0,
  }),
  actions: {
    async onAccountChange() {
      const tokensStore = useTokensStore();
      const knowledgeStore = useKnowledgeStore();
      const subscriptionsStore = useSubscriptionStore();

      this.ltaiBalance = await this.getLTAIBalance();

      await this.initAlephStorage();

      await Promise.all([tokensStore.update(), knowledgeStore.load(), subscriptionsStore.load()]);
    },

    async initAlephStorage() {
      const account = getAccount(config);
      const settingsStore = useSettingsStore();

      if (account.address === undefined) {
        return;
      }

      const hash = settingsStore.signatureHash[account.address] ?? (await AlephPersistentStorage.signBaseMessage());
      if (settingsStore.isSignatureHashStored) {
        settingsStore.signatureHash[account.address] = hash;
      }

      const alephStorage = await AlephPersistentStorage.initialize(hash);
      if (!alephStorage) {
        return;
      }

      this.alephStorage = alephStorage;
      const settingsOnAleph = await this.alephStorage.fetchSettings();
      const saveOnAleph = !settingsOnAleph;
      await settingsStore.update(settingsOnAleph ?? {}, saveOnAleph);
    },

    async getLTAIBalance(): Promise<number> {
      const account = getAccount(config);

      if (account.address === undefined) {
        return 0;
      }

      const balance = await getBalance(config, {
        address: account.address,
        token: LTAI_BASE_ADDRESS,
        chainId: env.WAGMI_BASE_ID,
      });

      return Number(balance.formatted);
    },

    onDisconnect() {
      this.alephStorage = null;
      this.ltaiBalance = 0;
    },
  },
});

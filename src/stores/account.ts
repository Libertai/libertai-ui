import { defineStore } from 'pinia';
import { AlephPersistentStorage } from 'src/utils/aleph-persistent-storage';
import { useSettingsStore } from 'stores/settings';
import { getBalance } from '@wagmi/core';
import { config } from 'src/config/wagmi';
import { base } from '@wagmi/vue/chains';
import { useTokensStore } from 'stores/tokens';
import { useKnowledgeStore } from 'stores/knowledge';
import { useSubscriptionStore } from 'stores/subscription';
import env from 'src/config/env';

const LTAI_BASE_ADDRESS = env.LTAI_BASE_ADDRESS as `0x${string}`;

type AccountStoreState = {
  alephStorage: AlephPersistentStorage | null;
  ltaiBalance: number;
  account: Account | null;
};

type Account = {
  address: string | `0x${string}`;
  chain: AccountChain;
};

export type AccountChain = 'base' | 'solana';

export const useAccountStore = defineStore('account', {
  state: (): AccountStoreState => ({
    alephStorage: null,
    ltaiBalance: 0,
    account: null,
  }),
  actions: {
    async onAccountChange(newAccount: Account) {
      if (this.account !== null && this.account.address === newAccount.address) {
        return;
      }

      this.account = newAccount;
      const tokensStore = useTokensStore();
      const knowledgeStore = useKnowledgeStore();
      const subscriptionsStore = useSubscriptionStore();

      this.ltaiBalance = await this.getLTAIBalance();

      await this.initAlephStorage();

      await Promise.all([tokensStore.update(), knowledgeStore.load(), subscriptionsStore.load()]);
    },

    async initAlephStorage() {
      const settingsStore = useSettingsStore();

      if (this.account === null) {
        return;
      }

      const hash =
        settingsStore.signatureHash[this.account.address] ??
        (await AlephPersistentStorage.signMessage(this.account.chain));
      if (settingsStore.isSignatureHashStored) {
        settingsStore.signatureHash[this.account.address] = hash;
      }

      const alephStorage = await AlephPersistentStorage.initialize(hash, this.account.chain);
      if (!alephStorage) {
        return;
      }

      this.alephStorage = alephStorage;
      const settingsOnAleph = await this.alephStorage.fetchSettings();
      const saveOnAleph = !settingsOnAleph;
      await settingsStore.update(settingsOnAleph ?? {}, saveOnAleph);
    },

    async getLTAIBalance(): Promise<number> {
      if (this.account === null || this.account.chain === 'solana') {
        return 0;
      }

      // TODO: handle solana
      const balance = await getBalance(config, {
        address: this.account.address as `0x${string}`,
        token: LTAI_BASE_ADDRESS,
        chainId: base.id,
      });

      return Number(balance.formatted);
    },

    onDisconnect() {
      this.account = null;
      this.alephStorage = null;
      this.ltaiBalance = 0;
    },
  },
});

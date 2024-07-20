import { defineStore } from 'pinia';
import { AlephPersistentStorage } from 'src/utils/aleph-persistent-storage';
import { useSettingsStore } from 'stores/settings';
import { getAccount, getBalance } from '@wagmi/core';
import { config } from 'src/config/wagmi';
import { base } from '@wagmi/vue/chains';
import { useTokensStore } from 'stores/tokens';
import { useModelsStore } from 'stores/models';

const LTAI_BASE_ADDRESS = '0xF8B1b47AA748F5C7b5D0e80C726a843913EB573a';

export const useAccountStore = defineStore('account', {
  state: () => ({
    alephStorage: null as AlephPersistentStorage | null,
    ltaiBalance: 0,
  }),
  actions: {
    async onAccountChange() {
      const tokensStore = useTokensStore();

      this.ltaiBalance = await this.getLTAIBalance();

      await this.initAlephStorage();
      await tokensStore.update();
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
      const settingsOnAleph = await this.alephStorage.fetch();
      await settingsStore.update(settingsOnAleph ?? {});
    },

    async getLTAIBalance(): Promise<number> {
      const account = getAccount(config);

      if (account.address === undefined) {
        return 0;
      }

      const balance = await getBalance(config, {
        address: account.address,
        token: LTAI_BASE_ADDRESS,
        chainId: base.id,
      });

      return Number(balance.formatted);
    },

    onDisconnect() {
      const modelsStore = useModelsStore();

      this.alephStorage = null;
      this.ltaiBalance = 0;
      modelsStore.unselectPremiumModel();
    },
  },
});

import { defineStore } from 'pinia';
import { AlephPersistentStorage } from 'src/utils/aleph-persistent-storage';
import { useSettingsStore } from 'stores/settings';
import { getAccount, getBalance } from '@wagmi/core';
import { config } from 'src/config/wagmi';
import { baseSepolia } from '@wagmi/vue/chains';
import { usePointsStore } from 'stores/points';

const LTAI_BASE_SEPOLIA_ADDRESS = '0xC442C8969357925B3f35e276Cb0b58b0C0ddeE91';

export const useAccountStore = defineStore('account', {
  state: () => ({
    alephStorage: null as AlephPersistentStorage | null,
    ltaiBalance: 0,
  }),
  actions: {
    async onAccountChange() {
      const pointsStore = usePointsStore();

      this.ltaiBalance = await this.getLTAIBalance();

      await this.initAlephStorage();
      await pointsStore.update();
    },

    async initAlephStorage() {
      const settingsStore = useSettingsStore();

      const alephStorage = await AlephPersistentStorage.initialize();
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
        address: '0x781Dfe7EE8700A7264A427E7f55082C5531a939D', // TODO: use real address
        token: LTAI_BASE_SEPOLIA_ADDRESS,
        chainId: baseSepolia.id,
      });

      return Number(balance.formatted);
    },

    onDisconnect() {
      this.alephStorage = null;
      this.ltaiBalance = 0;
    },
  },
});

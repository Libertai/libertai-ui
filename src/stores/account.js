import { defineStore } from 'pinia';
import { ethers } from 'ethers';
import { AlephPersistentStorage } from 'src/utils/aleph-persistent-storage';
import { useSettingsStore } from 'stores/settings';

export const useAccountStore = defineStore('account', {
  state: () => ({
    active: false,
    provider: null,
    signer: null,
    address: '',
    alephStorage: null,
  }),
  actions: {
    // any amount of arguments, return a promise or not
    async setProvider(provider) {
      // you can directly mutate the state
      this.provider = provider;
      provider.provider.on('accountsChanged', async (accounts) => {
        this.address = ethers.utils.getAddress(accounts[0]);
        this.signer = await this.provider.getSigner();
        await this.initAlephStorage();
      });
      this.signer = await this.provider.getSigner();
      this.address = await this.signer.getAddress();
      this.active = true;
      await this.initAlephStorage();
    },

    async initAlephStorage() {
      const settingsStore = useSettingsStore();

      this.alephStorage = await AlephPersistentStorage.initialize(this.signer);
      const settingsOnAleph = await this.alephStorage.fetch();
      settingsStore.update(settingsOnAleph ?? {});
    },

    disconnect() {
      this.active = false;
      this.provider = null;
      this.signer = null;
      this.address = '';
      this.alephStorage = null;
    },
  },
});

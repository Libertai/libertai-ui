import { defineStore } from 'pinia';
import { ethers } from 'ethers';
import { AlephPersistentStorage } from 'src/utils/aleph-persistent-storage';

export const useAccount = defineStore('account', {
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
        // TODO: Sign message again here and fetch data
      });
      this.signer = await this.provider.getSigner();
      this.address = await this.signer.getAddress();
      this.active = true;

      this.alephStorage = await AlephPersistentStorage.initialize(this.signer);
      this.alephStorage.save({ test: 'Saved from localhost' });
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

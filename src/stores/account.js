import { defineStore } from 'pinia';
import { ethers } from 'ethers';
import { NewAccount } from 'aleph-sdk-ts/dist/accounts/ethereum';

export const useAccount = defineStore('account', {
  state: () => ({
    active: false,
    provider: null,
    signer: null,
    address: '',
  }),
  getters: {
    alephAccount() {
      return {
        private_key: null,
        mnemonics: null,
        address: this.address,
        name: this.address,
        type: 'ETH',
        source: 'provider',
        provider: this.provider,
        signer: this.signer,
      };
    },
  },
  actions: {
    async getAccount() {
      if (!this.active) {
        throw new Error('No active provider');
      }
      // TODO: replace with the actual account
      // return await GetAccountFromProvider(this.provider);
      return NewAccount().account;
    },
    // any amount of arguments, return a promise or not
    async setProvider(provider) {
      // you can directly mutate the state
      this.provider = provider;
      console.log(provider.provider);
      provider.provider.on('accountsChanged', async (accounts) => {
        console.log('accountsChanged', accounts);
        this.address = ethers.utils.getAddress(accounts[0]);
        this.signer = await this.provider.getSigner();
      });
      console.log('provider', provider);
      this.signer = await this.provider.getSigner();
      this.address = await this.signer.getAddress();
      this.active = true;
    },
    disconnect() {
      this.active = false;
      this.provider = null;
      this.signer = null;
      this.address = '';
    },
  },
});

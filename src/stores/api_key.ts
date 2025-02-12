import { defineStore } from 'pinia';
import {
  TokenAccount,
  accountListAccountAddressListGet
} from 'src/apis/tokens'
import { useAccountStore } from 'stores/account';

type ApiKeyState = {
  accounts: TokenAccount[];
  revealMessage: string|undefined;
  revealMessageSignature: string|undefined;
  isLoaded: boolean;
  showKeys: boolean;
};

export const useApiKeyStore = defineStore('api_keys', {
  state: (): ApiKeyState => ({
    accounts: [],
    revealMessage: undefined,
    revealMessageSignature: undefined,
    isLoaded: false,
    showKeys: false,
  }),
  actions: {
    async load() {
      console.log("Loaded here");
      const { account } = useAccountStore();

      if (account === null) {
        return;
      }

      const response = await accountListAccountAddressListGet({
        path: {
          address: account.address,
        },
        query: {
          chain: account.chain,
          reveal_message_signature: this.revealMessageSignature
        }
      });

      this.accounts = response.data?.accounts ?? [];
      this.revealMessage = response.data?.reveal_message ?? undefined;
      this.isLoaded = true;
    },

    async revealKeys() {
      console.log("reveal keys", this.accounts, "n", this.revealMessage);
      if (this.revealMessageSignature) {
        this.load();
        this.showKeys = true;
        return;
      }

      const { account, signMessage } = useAccountStore();

      console.log("has account", account);
      if (account === null || !this.revealMessage) {
        return;
      }

      if (this.revealMessage != undefined) {
        console.log("Signing...");
        const messageToSign = this.revealMessage;
        const hash = await signMessage(messageToSign);
        this.revealMessageSignature = hash;
        console.log("signed message", hash);
        this.showKeys = true;
      }
    },

    async hideKeys() {
      for (let account of this.accounts) {
        account.token = "**hidden**";
      }
      this.showKeys = false;
    }
  }
});

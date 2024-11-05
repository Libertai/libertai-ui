import * as solana from '@solana/web3.js';
import { getBalance, signMessage as signWagmiMessage } from '@wagmi/core';
import { defineStore } from 'pinia';
import { useWallet } from 'solana-wallets-vue';
import env from 'src/config/env';
import { config } from 'src/config/wagmi';
import { AlephPersistentStorage, LIBERTAI_MESSAGE } from 'src/utils/aleph-persistent-storage';
import { useKnowledgeStore } from 'stores/knowledge';
import { useSettingsStore } from 'stores/settings';
import { useSubscriptionStore } from 'stores/subscription';
import { useTokensStore } from 'stores/tokens';

const LTAI_BASE_ADDRESS = env.LTAI_BASE_ADDRESS as `0x${string}`;
const LTAI_SOLANA_ADDRESS = env.LTAI_SOLANA_ADDRESS;

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

    async signMessage(message: string): Promise<`0x${string}` | string> {
      if (this.account === null) {
        throw Error('No account');
      }

      switch (this.account.chain) {
        case 'base':
          return signWagmiMessage(config, { message: message });
        case 'solana':
          const { signMessage: signSolanaMessage } = useWallet();
          const signature = await signSolanaMessage.value!(Buffer.from(message));
          return Buffer.from(signature).toString('base64');
      }
    },

    async initAlephStorage() {
      const settingsStore = useSettingsStore();

      if (this.account === null) {
        return;
      }

      const hash = settingsStore.signatureHash[this.account.address] ?? (await this.signMessage(LIBERTAI_MESSAGE));
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
      if (this.account === null) {
        return 0;
      }

      switch (this.account.chain) {
        case 'solana':
          const connection = new solana.Connection(env.SOLANA_RPC);
          const accountPublicKey = new solana.PublicKey(this.account.address);
          const mintAccount = new solana.PublicKey(LTAI_SOLANA_ADDRESS);

          const tokenAccount = await connection.getTokenAccountsByOwner(accountPublicKey, {
            mint: mintAccount,
          });

          if (tokenAccount.value.length != 1) {
            return 0;
          }

          const result = await connection.getTokenAccountBalance(tokenAccount.value[0].pubkey);
          return result.value.uiAmount ?? 0;

        case 'base':
          const balance = await getBalance(config, {
            address: this.account.address as `0x${string}`,
            token: LTAI_BASE_ADDRESS,
            chainId: env.WAGMI_BASE_ID,
          });

          return Number(balance.formatted);
      }
    },

    onDisconnect() {
      this.account = null;
      this.alephStorage = null;
      this.ltaiBalance = 0;
    },
  },
});

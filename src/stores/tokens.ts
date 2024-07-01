import { defineStore } from 'pinia';
import { AlephHttpClient } from '@aleph-sdk/client';

type TokensStoreState = {
  tokens: Record<string, number>;
  pending_tokens: Record<string, number>;
  estimated_3yr_tokens: Record<string, number>;
};

const AGGREGATE_PUBLISHER_ADDRESS = '0xCBFc3EeC41CBBfCAcc50337d712890C47a14ba99';
const AGGREGATE_KEYS = ['tokens', 'pending_tokens', 'estimated_3yr_tokens'];

export const useTokensStore = defineStore('tokens', {
  state: (): TokensStoreState => ({
    tokens: {},
    pending_tokens: {},
    estimated_3yr_tokens: {},
  }),
  actions: {
    async update() {
      const client = new AlephHttpClient();

      const tokensData = await client.fetchAggregates(AGGREGATE_PUBLISHER_ADDRESS, AGGREGATE_KEYS);
      this.tokens = tokensData.tokens;
      this.pending_tokens = tokensData.pending_tokens;
      this.estimated_3yr_tokens = tokensData.estimated_3yr_tokens;
    },

    getAddressTokens(address: string): number {
      if (address in this.tokens) {
        return this.tokens[address];
      }
      return 0;
    },

    getAddressPendingTokens(address: string): number {
      if (address in this.pending_tokens) {
        return this.pending_tokens[address];
      }
      return 0;
    },

    getAddress3yrEstimatedTokens(address: string): number {
      if (address in this.estimated_3yr_tokens) {
        return this.estimated_3yr_tokens[address];
      }
      return 0;
    },
  },
});

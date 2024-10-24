import { getAccount, signMessage } from '@wagmi/core';
import { defineStore } from 'pinia';
import {
  BaseSubscription,
  getUserSubscriptionsSubscriptionsGet,
  holdSubscriptionMessagesHoldMessageGet,
  subscribeHoldSubscriptionPost,
  SubscriptionType,
} from 'src/apis/subscriptions';
import { config } from 'src/config/wagmi';

type SubscriptionState = {
  subscriptions: BaseSubscription[];
  isLoaded: boolean;
};

export const useSubscriptionStore = defineStore('subscriptions', {
  state: (): SubscriptionState => ({
    subscriptions: [],
    isLoaded: false,
  }),
  actions: {
    async load() {
      const account = getAccount(config);
      const address = account.address;

      if (address === undefined) {
        return;
      }

      const response = await getUserSubscriptionsSubscriptionsGet({ query: { address } });

      this.subscriptions = response.data?.subscriptions ?? [];
      this.isLoaded = true;
    },

    async holdSubscribe(subscriptionType: SubscriptionType) {
      const account = getAccount(config);
      const address = account.address;

      if (address === undefined) {
        return;
      }

      const messagesResponse = await holdSubscriptionMessagesHoldMessageGet({
        query: { subscription_type: subscriptionType },
      });

      if (messagesResponse.data === undefined) {
        throw new Error(
          messagesResponse.error.detail?.toString() ?? 'Unable to fetch the message to sign to subscribe',
        );
      }

      const messageToSign = messagesResponse.data.subscribe_message;
      const hash = await signMessage(config, { message: messageToSign });

      const subscriptionResponse = await subscribeHoldSubscriptionPost({
        body: {
          signature: hash,
          type: subscriptionType,
          account: { chain: 'base', address },
        },
      });
      console.log(subscriptionResponse);
    },
  },
});

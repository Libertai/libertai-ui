import { defineStore } from 'pinia';
import {
  BaseSubscription,
  getUserSubscriptionsSubscriptionsGet,
  holdSubscriptionMessagesHoldMessageGet,
  subscribeHoldSubscriptionPost,
  SubscriptionType,
} from 'src/apis/subscriptions';
import { useAccountStore } from 'stores/account';
import { useAgentStore } from 'stores/agent';

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
      const { account } = useAccountStore();
      const agentStore = useAgentStore();

      if (account === null) {
        return;
      }

      const response = await getUserSubscriptionsSubscriptionsGet({
        query: {
          address: account.address,
          chain: account.chain,
        },
      });

      this.subscriptions = response.data?.subscriptions ?? [];
      this.isLoaded = true;
      agentStore.load().then();
    },

    async holdSubscribe(subscriptionType: SubscriptionType) {
      const { account, signMessage } = useAccountStore();

      if (account === null) {
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
      const hash = await signMessage(messageToSign);

      const subscriptionResponse = await subscribeHoldSubscriptionPost({
        body: {
          signature: hash,
          type: subscriptionType,
          account: { chain: 'base', address: account.address },
        },
      });
      console.log(subscriptionResponse);
    },
  },
});

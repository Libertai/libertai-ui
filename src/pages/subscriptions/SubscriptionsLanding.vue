<template>
  <q-page>
    <section class="max-sm:tw-mx-4 sm:tw-mx-10 tw-my-5">
      <div class="tw-mb-5 tw-flex tw-flex-col tw-items-center tw-space-y-6">
        <h1 class="tw-text-4xl tw-font-semibold">Subscriptions</h1>
        <p class="tw-text-xs tw-font-semibold">Select a plan that suits your needs</p>
      </div>

      <q-linear-progress v-if="!subscriptionsStore.isLoaded && accountStore.account !== null" indeterminate />

      <div class="lg:tw-flex tw-space-x-5 tw-hidden">
        <subscription-plan-card
          v-for="subscriptionPlan of displayedSubscriptionPlans"
          :key="subscriptionPlan.type"
          :subscription-plan="subscriptionPlan"
          @subscribe="subscribe(subscriptionPlan)"
        />
      </div>

      <q-carousel
        v-model="slide"
        :control-color="$q.dark.mode ? 'white' : 'black'"
        animated
        arrows
        class="tw-hidden max-lg:tw-block"
        padding
        swipeable
        transition-next="jump-left"
        transition-prev="jump-right"
      >
        <q-carousel-slide
          v-for="subscriptionPlan of displayedSubscriptionPlans"
          :key="subscriptionPlan.type"
          :name="subscriptionPlan.type"
        >
          <subscription-plan-card :subscription-plan="subscriptionPlan" />
        </q-carousel-slide>
      </q-carousel>

      <q-btn
        class="border-primary-highlight"
        no-caps
        rounded
        text-color="dark-mode-text"
        unelevated
        @click="subscriptionsStore.holdSubscribe('pro')"
      >
        New Pro hold subscription
      </q-btn>
    </section>
    <!--   TODO: remove test data   -->
    <div class="q-pa-md">
      <h3>Current subscription</h3>
      <q-card class="q-pa-md row">
        <p v-if="subscriptionsStore.subscriptions.length === 0">No subscriptions</p>
        <div v-for="subscription of subscriptionsStore.subscriptions" v-else :key="subscription.id">
          <p>
            type: {{ subscription.type }} <br />
            Provider: {{ subscription.provider }}
          </p>
        </div>
      </q-card>
    </div>
    <div class="q-pa-md">
      <q-linear-progress v-if="!apiKeysStore.isLoaded && apiKeysStore.accounts.length == 0" indeterminate />
      <h3>API keys</h3>
      <q-card class="q-pa-md">
        <p v-if="apiKeysStore.accounts.length === 0">No api keys</p>
        <p v-else>
          <q-btn v-if="!apiKeysStore.showKeys" color="primary" @click="apiKeysStore.revealKeys()"
            >Reveal api keys
          </q-btn>
          <q-btn v-if="apiKeysStore.showKeys" color="primary" @click="apiKeysStore.hideKeys()">Hide api keys</q-btn>
          <br /><br />
          <q-markup-table>
            <thead>
              <tr>
                <th class="text-left">Key name</th>
                <th class="text-left">Public Key</th>
                <th class="text-left">Secret Key</th>
                <th class="text-left">API Endpoint</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="api_account of apiKeysStore.accounts" :key="api_account.sha1_token">
                <td class="text-left">{{ api_account.name }}</td>
                <td class="text-left">{{ api_account.sha1_token }}</td>
                <td class="text-left">
                  {{ api_account.token }}
                </td>
                <td>https://llm.libertai.io</td>
              </tr>
            </tbody>
          </q-markup-table>
        </p>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import SubscriptionPlanCard from 'components/card/SubscriptionPlanCard.vue';
import { useQuasar } from 'quasar';
import { subscriptionPlans, UISubscriptionPlan } from 'src/types/subscriptions';
import { useAccountStore } from 'stores/account';
import { useApiKeyStore } from 'stores/api_key';
import { useGeneralStore } from 'stores/general';
import { useSubscriptionStore } from 'stores/subscription';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const subscriptionsStore = useSubscriptionStore();
const apiKeysStore = useApiKeyStore();
const generalStore = useGeneralStore();
const accountStore = useAccountStore();
const router = useRouter();
const $q = useQuasar();

onMounted(() => {
  generalStore.isSidebarOpen = false;
  apiKeysStore.load();
});

const slide = ref('free');

const subscribe = (subscriptionPlan: UISubscriptionPlan) => {
  switch (subscriptionPlan.type) {
    case 'free':
      $q.notify({ message: 'Connect your wallet to use all our free features', color: 'info' });
      return;
    case 'pro':
    case 'advanced':
      router.push({ path: '/subscriptions/subscribe', query: { type: subscriptionPlan.type } });
      break;
    case 'enterprise':
      window.open('mailto:hello@libertai.io', '_blank');
      return;
    default:
      return;
  }
};

const displayedSubscriptionPlans = computed((): UISubscriptionPlan[] => {
  const isLoggedIn = accountStore.account !== null;
  const hasProSubscription = !!subscriptionsStore.subscriptions.find((subscription) => subscription.type === 'pro');
  const hasAdvancedSubscription = !!subscriptionsStore.subscriptions.find(
    (subscription) => subscription.type === 'advanced',
  );

  return [
    {
      ...subscriptionPlans.free,
      button: {
        text: !isLoggedIn || hasProSubscription || hasAdvancedSubscription ? 'Try LibertAI' : 'Current tier',
        disabled: isLoggedIn,
      },
    },
    {
      ...subscriptionPlans.pro,
      button: {
        text: hasProSubscription
          ? 'Current tier'
          : hasAdvancedSubscription
            ? 'Existing higher subscription'
            : 'Upgrade',
        disabled: hasProSubscription,
      },
    },
    {
      ...subscriptionPlans.advanced,
      button: {
        text: hasAdvancedSubscription ? 'Current tier' : 'Upgrade',
        disabled: hasAdvancedSubscription,
      },
    },
    {
      ...subscriptionPlans.enterprise,
      button: {
        text: 'Get in touch',
        disabled: false,
      },
    },
  ];
});
</script>

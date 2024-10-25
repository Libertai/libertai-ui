<template>
  <authenticated-page>
    <section class="max-sm:tw-mx-4 sm:tw-mx-10 tw-my-5">
      <div class="tw-mb-5 tw-flex tw-flex-col tw-items-center tw-space-y-6">
        <h1 class="tw-text-4xl tw-font-semibold">Subscriptions</h1>
        <p class="tw-text-xs tw-font-semibold">Select a plan that suits your needs</p>
      </div>

      <div class="md:tw-flex tw-space-x-5 tw-hidden">
        <subscription-plan-card
          v-for="subscriptionPlan of subscriptionPlans"
          :key="subscriptionPlan.type"
          :subscription-plan="subscriptionPlan"
        />
      </div>

      <q-carousel
        v-model="slide"
        :control-color="$q.dark.mode ? 'white' : 'black'"
        animated
        arrows
        class="tw-hidden max-md:tw-block"
        padding
        swipeable
        transition-next="jump-left"
        transition-prev="jump-right"
      >
        <q-carousel-slide
          v-for="subscriptionPlan of subscriptionPlans"
          :key="subscriptionPlan.type"
          :name="subscriptionPlan.type"
        >
          <subscription-plan-card :subscription-plan="subscriptionPlan" />
        </q-carousel-slide>
      </q-carousel>

      <!--   TODO: remove test data   -->
      <q-linear-progress v-if="!subscriptionsStore.isLoaded" indeterminate />
      <p v-else-if="subscriptionsStore.subscriptions.length === 0">No subscriptions</p>
      <div v-for="subscription of subscriptionsStore.subscriptions" v-else :key="subscription.id">
        <p>{{ subscription.type }} {{ subscription.provider }}</p>
      </div>

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
  </authenticated-page>
</template>

<script lang="ts" setup>
import SubscriptionPlanCard from 'components/card/SubscriptionPlanCard.vue';
import AuthenticatedPage from 'layouts/AuthenticatedPage.vue';
import { SubscriptionPlan } from 'src/types/subscriptions';
import { useGeneralStore } from 'stores/general';
import { useSubscriptionStore } from 'stores/subscription';
import { onMounted, ref } from 'vue';

const subscriptionsStore = useSubscriptionStore();
const generalStore = useGeneralStore();

onMounted(() => {
  generalStore.isSidebarOpen = false;
});

const subscriptionPlans: SubscriptionPlan[] = [
  {
    type: 'free',
    name: 'Basic',
    description:
      "Perfect for those who want to explore LibertAI's capabilities without committing to a paid subscription.",
    monthly_use_price: 0,
    button: {
      text: 'Try LibertAI',
      disabled: false,
    },
    features: ['25 text prompts per day', 'Change AI Personas', '1 Knowledge Base (Max 10MB)', 'Basic AI Models'],
  },
  {
    type: 'pro',
    name: 'Superior',
    description: 'This tier is ideal for individuals who require Professional AI capabilities and additional features',
    monthly_use_price: 7,
    hold_price: 500,
    button: {
      text: 'Upgrade',
      disabled: false,
    },
    features: [
      '100 text prompts per day',
      'Change AI Personas',
      '3 Knowledge Base (Max 30MB)',
      'Pro AI Models',
      'Limited API key usage',
    ],
  },
  {
    type: 'advanced',
    name: 'Ultimate',
    description: 'Premium tier that offers the most comprehensive set of features and benefits',
    monthly_use_price: 21,
    hold_price: 1500,
    button: {
      text: 'Upgrade',
      disabled: false,
    },
    features: [
      '500 text prompts per day',
      'Change AI Personas',
      '10 Knowledge Base (Max 300MB)',
      'All AI Models',
      'Advanced API key usage',
      'Free trials and benefits for new features',
    ],
  },
];

const slide = ref(subscriptionPlans[0].type);
</script>

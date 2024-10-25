<template>
  <authenticated-page v-if="plan !== undefined">
    <section class="max-sm:tw-mx-4 sm:tw-mx-10 tw-my-5">
      <div class="tw-mb-5 tw-flex tw-flex-col tw-items-center tw-space-y-6">
        <h1 class="tw-text-3xl tw-text-center">
          Subscribe to the <span class="tw-text-4xl tw-font-semibold">{{ plan.name }}</span> plan
        </h1>
        <ul>
          <li v-for="feature of plan.features" :key="feature">
            <q-icon name="check_circle" />
            {{ feature }}
          </li>
        </ul>
      </div>

      <q-card class="tw-shadow-none tw-rounded-2xl tw-justify-center tw-border tw-p-2">
        <h2 class="tw-text-2xl">Payment method</h2>
        <div class="tw-flex tw-text-lg tw-justify-center">
          <p :class="{ 'unselected-payment-method': isPaymentHolding }" class="tw-my-auto">Monthly payment</p>
          <q-toggle v-model="isPaymentHolding" />
          <p :class="{ 'unselected-payment-method': !isPaymentHolding }" class="tw-my-auto">Holding tokens</p>
        </div>
      </q-card>
    </section>
  </authenticated-page>
</template>

<script lang="ts" setup>
import AuthenticatedPage from 'layouts/AuthenticatedPage.vue';
import { FullUserSubscriptionType, SubscriptionPlan, subscriptionPlans } from 'src/types/subscriptions';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const plan = ref<SubscriptionPlan>();
const isPaymentHolding = ref(false);

onMounted(() => {
  plan.value = subscriptionPlans[route.query.type as FullUserSubscriptionType];
});
</script>

<style scoped>
.unselected-payment-method {
  opacity: 0.4;
}
</style>

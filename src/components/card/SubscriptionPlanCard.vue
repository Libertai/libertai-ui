<template>
  <q-card class="tw-min-w-56">
    <q-card-actions class="tw-space-y-2">
      <p class="tw-font-semibold tw-text-3xl">{{ subscriptionPlan.name }}</p>
      <p class="tw-text-xs">{{ subscriptionPlan.description }}</p>
    </q-card-actions>

    <q-card-section>
      <p>
        <span class="tw-text-5xl tw-font-black">${{ subscriptionPlan.monthly_use_price }}</span>
        <span class="tw-text-2xl tw-font-normal"> /month</span>
      </p>

      <q-btn
        :disabled="subscriptionPlan.button.disabled"
        class="tw-my-4 tw-w-full"
        color="primary"
        no-caps
        rounded
        unelevated
      >
        <span class="tw-text-lg tw-font-bold">
          {{ subscriptionPlan.button.text }}
        </span>
      </q-btn>

      <div>
        <p v-for="feature of subscriptionPlan.features" :key="feature" class="tw-text-xs tw-font-bold">
          <q-icon name="check_circle" />
          {{ feature }}
        </p>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { SubscriptionPlan } from 'src/types/subscriptions';

const { subscriptionPlan } = defineProps<{ subscriptionPlan: SubscriptionPlan }>();
</script>

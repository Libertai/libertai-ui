<template>
  <q-card>
    <q-card-section class="tw-space-y-2">
      <p class="tw-font-semibold tw-text-3xl">{{ subscriptionPlan.name }}</p>
      <p class="tw-text-xs">{{ subscriptionPlan.description }}</p>
    </q-card-section>

    <q-card-section>
      <p>
        <span v-if="subscriptionPlan.monthly_use_price !== undefined">
          <span class="tw-text-5xl tw-font-black">${{ subscriptionPlan.monthly_use_price }}</span>
          <span class="tw-text-2xl tw-font-normal"> /month</span>
        </span>
        <span v-else class="tw-invisible">
          <span class="tw-text-5xl tw-font-black">$0</span>
          <span class="tw-text-2xl tw-font-normal"> /month</span>
        </span>
        <br />
        <span v-if="subscriptionPlan.hold_price !== undefined" class="tw-text-lg"
          >or hold {{ subscriptionPlan.hold_price }} $LTAI</span
        >
        <span v-else class="tw-invisible tw-text-lg">or hold 100 $LTAI</span>
      </p>

      <q-btn
        :disabled="subscriptionPlan.button.disabled"
        class="tw-my-4 tw-w-full"
        color="primary"
        no-caps
        rounded
        unelevated
        @click="emit('subscribe')"
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
import { UISubscriptionPlan } from 'src/types/subscriptions';

const { subscriptionPlan } = defineProps<{ subscriptionPlan: UISubscriptionPlan }>();

const emit = defineEmits<{ subscribe: [] }>();
</script>

<template>
  <authenticated>
    <section class="max-sm:tw-mx-4 sm:tw-mx-10 tw-my-5">
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
  </authenticated>
</template>

<script lang="ts" setup>
import { useSubscriptionStore } from 'stores/subscription';
import Authenticated from 'layouts/Authenticated.vue';

const subscriptionsStore = useSubscriptionStore();
</script>

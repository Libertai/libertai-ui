<template>
  <authenticated-page>
    <section class="max-sm:tw-mx-4 sm:tw-mx-10 tw-my-5">
      <div class="tw-mb-5 tw-flex tw-flex-col tw-items-center tw-space-y-6">
        <h1 class="tw-text-4xl tw-font-semibold">Subscriptions</h1>
        <p class="tw-text-xs tw-font-semibold">Select a plan that suits your needs</p>
      </div>
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
import AuthenticatedPage from 'layouts/AuthenticatedPage.vue';
import { useGeneralStore } from 'stores/general';
import { useSubscriptionStore } from 'stores/subscription';
import { onMounted } from 'vue';

const subscriptionsStore = useSubscriptionStore();
const generalStore = useGeneralStore();

onMounted(() => {
  generalStore.isSidebarOpen = false;
});
</script>

<template>
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
      @click="subscriptionsStore.holdSubscribe('standard')"
    >
      New standard hold subscription
    </q-btn>
  </section>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useAccount } from '@wagmi/vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSubscriptionStore } from 'stores/subscription';

const $q = useQuasar();
const router = useRouter();
const account = useAccount();

const subscriptionsStore = useSubscriptionStore();

onMounted(async () => {
  if (!account.isConnected.value) {
    $q.notify({ message: 'Account not connected', color: 'negative' });
    await router.push({ path: '/' });
    return;
  }
});
</script>

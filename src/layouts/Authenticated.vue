<template>
  <slot v-if="account.isConnected.value" />
</template>

<script lang="ts" setup>
import { useAccount } from '@wagmi/vue';
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const account = useAccount();

onMounted(async () => {
  if (!account.isConnected.value) {
    $q.notify({ message: 'Account not connected', color: 'negative' });
    await router.push({ path: '/' });
    return;
  }
});
</script>

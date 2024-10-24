<template>
  <h2>Yo</h2>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useAccount } from '@wagmi/vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const account = useAccount();
const router = useRouter();
const $q = useQuasar();

onMounted(async () => {
  if (!account.isConnected.value) {
    $q.notify({ message: 'Account not connected', color: 'negative' });
    await router.push({ path: '/' });
  }
});
</script>

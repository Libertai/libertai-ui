<template>
  <q-page>
    <slot v-if="accountStore.account !== null" />
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { useAccountStore } from 'stores/account';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const accountStore = useAccountStore();

onMounted(async () => {
  if (accountStore.account === null) {
    $q.notify({ message: 'You must connect your wallet to access this page', color: 'negative' });
    await router.push({ path: '/' });
  }
});
</script>

<template>
  <q-scroll-area style="height: calc(100vh - 50px)">
    <q-page v-if="address" class="flex flex-center text-purple-700">
      <div class="row q-pa-xl q-col-gutter-md">
        <q-card class="col-12 text-center" flat>
          <q-card-section>
            <p class="q-py-md">
              <span v-if="$q.screen.gt.sm" class="bg-purple-50 q-py-sm q-px-xl rounded text-bold">
                {{ address }}
              </span>
              <span v-else class="bg-purple-50 q-py-sm q-px-xl rounded text-bold">
                {{ address.slice(0, 10) }}...{{ address.slice(-10) }}
              </span>
            </p>
            <div class="text-h4 text-bold q-pb-sm text-center">Your LibertAI tokens</div>
            <p class="text-center">
              Run aleph.im network nodes, stake ALEPH to continue earning $LTAI. New ways will be available soon!
            </p>
          </q-card-section>
        </q-card>
        <q-card class="col-12 column" flat>
          <q-card-section class="bg-purple-50 q-pa-xl row text-bold max-lg:tw-text-center">
            <div :class="`text-h6 lg:tw-text-left ${$q.screen.gt.sm ? 'col-8' : 'col-12'}`">
              <q-avatar class="q-mr-sm">
                <img alt="libertai" src="/icons/libertai.svg" />
              </q-avatar>
              <span>Current $LTAI balance</span>
            </div>

            <div :class="`tw-py-4 ${$q.screen.gt.sm ? 'col-4 column text-right' : 'col-12'}`">
              <span class="text-h4 text-bold">{{ tokensStore.getAddressTokens(address).toFixed(2) }}</span>
            </div>
          </q-card-section>
        </q-card>
        <q-card :class="$q.screen.gt.sm ? 'col-6 column' : 'col-12'" flat>
          <q-card-section class="bg-purple-50 q-pa-xl">
            <p class="text-h6 text-bold max-md:tw-text-center md:tw-text-left">Pending $LTAI</p>
            <p class="q-py-md md:tw-text-right max-md:tw-text-center">
              <span class="text-h4 text-bold rounded">{{
                tokensStore.getAddressPendingTokens(address).toFixed(2)
              }}</span>
            </p>
          </q-card-section>
        </q-card>
        <q-card :class="$q.screen.gt.sm ? 'col-6 column' : 'col-12'" flat>
          <q-card-section class="bg-purple-50 q-pa-xl">
            <p class="text-h6 text-bold md:tw-text-left max-md:tw-text-center">36 Month estimated $LTAI*</p>
            <p class="q-py-md md:tw-text-right max-md:tw-text-center">
              <span class="text-h4 text-bold rounded">{{
                tokensStore.getAddress3yrEstimatedTokens(address).toFixed(2)
              }}</span>
            </p>
          </q-card-section>
        </q-card>
        <p class="text-grey text-center col-12">
          * Estimate only, and under current rules, if your participation stays at the same level. <br />
          The availability of $LTAI tokens is subject to change without notice. We may suspend, modify, or terminate the
          program at our sole discretion and without liability. Your participation does not guarantee that you will
          receive any specific amount of tokens.
        </p>
      </div>
    </q-page>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTokensStore } from 'stores/tokens';
import web3 from 'web3';

const route = useRoute();
const router = useRouter();

const tokensStore = useTokensStore();

const $q = useQuasar();

// got address as an address part from vue router
const address = ref<string | null>(null);

onMounted(async () => {
  if (Object.keys(tokensStore.tokens).length === 0) {
    await tokensStore.update();
  }
});

watch(
  () => route.params.address as string,
  async (newAddress: string) => {
    try {
      address.value = web3.utils.toChecksumAddress(newAddress);
    } catch (err) {
      $q.notify({
        message: 'Invalid address',
        color: 'negative',
      });
      router.push('/tokens');
    }
  },
  {
    immediate: true,
  },
);
</script>

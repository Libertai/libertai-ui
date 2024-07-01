<template>
  <q-scroll-area style="height: calc(100vh - 50px)">
    <q-page class="flex flex-center text-purple-700 q-mx-md">
      <div class="row q-pa-xl q-col-gutter-md">
        <q-card class="col-12" flat>
          <q-card-section>
            <div class="text-h4 text-bold">Earn $LTAI tokens</div>
          </q-card-section>
          <q-card-section>
            <p>
              Are you ready to dive into a new world of decentralized computing, where your contributions are rewarded
              with tangible benefits? Look no further than $LTAI token! This token plays an essential role within the
              exciting and innovative Aleph.im ecosystem.
            </p>

            <p>How to participate:</p>
          </q-card-section>
        </q-card>
        <q-card :class="$q.screen.gt.sm ? 'col-6 text-center column' : 'text-center'" flat>
          <q-card-section class="bg-purple-50">
            <div class="text-h6 text-semibold">Stake ALEPH</div>
          </q-card-section>
          <q-card-section class="q-pt-none bg-purple-50 col-grow">
            <p>
              Staking 10K or more Aleph tokens ($ALEPH) - By showing your commitment to the future of decentralized
              cloud technology, you earn $LTAI tokens that reflect your trust in the platform.
            </p>
          </q-card-section>
        </q-card>
        <q-card :class="$q.screen.gt.sm ? 'col-6 text-center column' : 'text-center'" flat>
          <q-card-section class="bg-purple-50">
            <div class="text-h6 text-semibold">aleph.im Core Channel Node Operator</div>
          </q-card-section>
          <q-card-section class="q-pt-none bg-purple-50 col-grow">
            <p>
              Running an Aleph.im Core Channel Node - Become a part of the backbone that supports cross-chain
              interactions and enjoy the perks of being a node operator with $LTAI tokens as your reward!
            </p>
          </q-card-section>
        </q-card>
        <q-card :class="$q.screen.gt.sm ? 'col-6 text-center column' : 'text-center'" flat>
          <q-card-section class="bg-purple-50">
            <div class="text-h6 text-semibold">aleph.im Resource Node Operator</div>
          </q-card-section>
          <q-card-section class="q-pt-none bg-purple-50 col-grow">
            <p>
              Operating an Aleph.im Resource Node - Contribute to data storage, compute capabilities, and decentralized
              applications by running a resource node and reap the benefits through $LTAI tokens!
            </p>
          </q-card-section>
        </q-card>
        <q-card :class="$q.screen.gt.sm ? 'col-6 text-center column' : 'text-center'" flat>
          <q-card-section class="bg-purple-50">
            <div class="text-h6 text-semibold">Connect your wallet and Start earning $LTAI today!</div>
          </q-card-section>
          <q-card-section class="q-pt-none bg-purple-50 col-grow">
            <p>
              So, are you ready to join this revolutionary journey and unlock the power of $LTAI tokens? Let's get
              started together and shape the future of decentralized cloud technology!
            </p>
          </q-card-section>
        </q-card>
        <q-card class="col-12 text-center" flat>
          <q-card-section class="bg-purple-50">
            <div class="text-h6">Check your tokens</div>
          </q-card-section>
          <q-card-section class="q-pt-none bg-purple-50">
            <q-input
              v-model="address"
              :rules="addressRules"
              autofocus
              bg-color="secondary"
              bottom-slots
              class="q-pa-lg"
              counter
              input-class="text-light"
              label="Address"
              label-color="grey"
              maxlength="42"
              outlined
              rounded
              standout
            >
              <template #prepend>
                <q-icon name="wallet" />
              </template>

              <template #hint>Enter an address to check if there are $LTAI tokens associated with it.</template>
            </q-input>
            <div v-if="addressVerifier(address) === true" class="text-h6 text-bold q-pa-lg">
              <div v-if="tokensStore.getAddressTokens(address) === 0">
                You have no $LTAI so far. You can still earn $LTAI by staking ALEPH or running a node!
              </div>
              <div v-else>
                You have $LTAI!<br /><br />
                <q-btn
                  :to="{ name: 'tokens-detail', params: { address: address } }"
                  color="white"
                  label="View details"
                  no-caps
                  rounded
                  text-color="primary"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-page>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import { useTokensStore } from 'stores/tokens';
import { ethers } from 'ethers';

const tokensStore = useTokensStore();
const address = ref('');

onMounted(async () => {
  if (Object.keys(tokensStore.tokens).length === 0) {
    await tokensStore.update();
  }
});

function addressVerifier(val: string) {
  // Throws if a checksummed address is provided, but a
  // letter is the wrong case
  try {
    const addr = ethers.utils.getAddress(val);
    if (addr !== val) {
      nextTick(() => {
        address.value = addr;
      });
    }
    return true;
  } catch (e) {
    return 'Invalid address';
  }
}

const addressRules = [(val: string) => (val && val.length > 0) || 'Please type something', addressVerifier];
</script>

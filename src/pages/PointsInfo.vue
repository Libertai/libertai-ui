<template>
  <q-page class="flex flex-center bg-dark_deleted font-mulish text-purple-700">
    <div class="row q-pa-xl q-col-gutter-md">
      <q-card class="col-12 text-center" flat>
        <q-card-section class="bg-dark-page_deleted">
          <div class="text-h4 text-bold">Earn Libertai Points</div>
        </q-card-section>
        <q-card-section class="q-pt-none bg-dark-page_deleted">
          <p>
            Are you ready to dive into a new world of decentralized computing, where your contributions are rewarded
            with tangible benefits? Look no further than Libertai Points! These points play an essential role within the
            exciting and innovative Aleph.im ecosystem.
          </p>

          <p>How to participate:</p>
        </q-card-section>
      </q-card>
      <q-card class="col-6 text-center column" flat>
        <q-card-section class="bg-purple-50">
          <div class="text-h6 text-semibold">Stake ALEPH</div>
        </q-card-section>
        <q-card-section class="q-pt-none bg-purple-50 col-grow">
          <p>
            Staking 10K or more Aleph tokens ($ALEPH) - By showing your commitment to the future of decentralized cloud
            technology, you earn Libertai Points that reflect your trust in the platform.
          </p>
        </q-card-section>
      </q-card>
      <q-card class="col-6 text-center column" flat>
        <q-card-section class="bg-purple-50">
          <div class="text-h6 text-semibold">aleph.im Core Channel Node Operator</div>
        </q-card-section>
        <q-card-section class="q-pt-none bg-purple-50 col-grow">
          <p>
            Running an Aleph.im Core Channel Node - Become a part of the backbone that supports cross-chain interactions
            and enjoy the perks of being a node operator with Libertai Points as your reward!
          </p>
        </q-card-section>
      </q-card>
      <q-card class="col-6 text-center column" flat>
        <q-card-section class="bg-purple-50">
          <div class="text-h6 text-semibold">aleph.im Resource Node Operator</div>
        </q-card-section>
        <q-card-section class="q-pt-none bg-purple-50 col-grow">
          <p>
            Operating an Aleph.im Resource Node - Contribute to data storage, compute capabilities, and decentralized
            applications by running a resource node and reap the benefits through Libertai Points!
          </p>
        </q-card-section>
      </q-card>
      <q-card class="col-6 text-center column" flat>
        <q-card-section class="bg-purple-50">
          <div class="text-h6 text-semibold">Connect your wallet and Start earning points today!</div>
        </q-card-section>
        <q-card-section class="q-pt-none bg-purple-50 col-grow">
          <p>
            So, are you ready to join this revolutionary journey and unlock the power of Libertai Points? Let's get
            started together and shape the future of decentralized cloud technology!
          </p>
        </q-card-section>
      </q-card>
      <q-card class="col-12 text-center" flat>
        <q-card-section class="bg-purple-50">
          <div class="text-h6">Check your points</div>
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
            rounded
            standout
          >
            <template v-slot:prepend>
              <q-icon name="wallet" />
            </template>

            <template v-slot:hint> Enter an address to check if there are points associated with it.</template>
          </q-input>
          <div v-if="addressVerifier(address) === true" class="text-h6 text-bold q-pa-lg">
            <div v-if="points.getAddressPoints(address) === 0">
              You have no point so far. You can still earn points by staking ALEPH or running a node!
            </div>
            <div v-else>
              You have points!<br /><br />
              <q-btn
                :to="{ name: 'points-detail', params: { address: address } }"
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
</template>

<script>
import { defineComponent, nextTick, onMounted, ref } from 'vue';
import { usePoints } from '../stores/points';
import { ethers } from 'ethers';

export default defineComponent({
  name: 'PointsInfo',
  setup() {
    const expanded = ref(false);
    const points = usePoints();
    const address = ref('');
    onMounted(async () => {
      if (Object.keys(points.points).length === 0) {
        points.update();
      }
    });

    function addressVerifier(val) {
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

    // points.points is an object, let's check if it's empty

    // const count = ref(0)
    return {
      points,
      expanded,
      address,
      addressVerifier,
      addressRules: [
        addressVerifier,
        (val) => (val && val.length > 0) || 'Please type something',
        (val) => (val && val.length > 0) || 'Please type something',
      ],
    };
  },
});
</script>

<template>
    <q-page class="flex flex-center bg-dark">
        <div class="row q-pa-xl q-col-gutter-md">
            <q-card flat class="col-12 text-center">
                <q-card-section class="bg-dark-page">
                    <div class="text-h4 text-bold">Earn Libertai Points</div>
                </q-card-section>
                <q-card-section class="q-pt-none bg-dark-page">
                    <p>Are you ready to dive into a new world of decentralized computing, where your contributions are rewarded with tangible benefits? Look no further than Libertai Points! These points play an essential role within the exciting and innovative Aleph.im ecosystem.</p>

                    <p>How to participate:</p>
                </q-card-section>
            </q-card>
            <q-card flat class="col-6 text-center column">
                <q-card-section class="bg-primary">
                    <div class="text-h6 text-semibold">Stake ALEPH</div>
                </q-card-section>
                <q-card-section class="q-pt-none bg-primary col-grow">
                    <p>Staking 10K or more Aleph tokens ($ALEPH) - By showing your commitment to the future of decentralized cloud technology, you earn Libertai Points that reflect your trust in the platform.</p>
                </q-card-section>
            </q-card>
            <q-card flat class="col-6 text-center column">
                <q-card-section class="bg-primary">
                    <div class="text-h6 text-semibold">aleph.im Core Channel Node Operator</div>
                </q-card-section>
                <q-card-section class="q-pt-none bg-primary col-grow">
                    <p>Running an Aleph.im Core Channel Node - Become a part of the backbone that supports cross-chain interactions and enjoy the perks of being a node operator with Libertai Points as your reward!</p>
                </q-card-section>
            </q-card>
            <q-card flat class="col-6 text-center column">
                <q-card-section class="bg-primary">
                    <div class="text-h6 text-semibold">aleph.im Resource Node Operator</div>
                </q-card-section>
                <q-card-section class="q-pt-none bg-primary col-grow">
                    <p>Operating an Aleph.im Resource Node - Contribute to data storage, compute capabilities, and decentralized applications by running a resource node and reap the benefits through Libertai Points!</p>
                </q-card-section>
            </q-card>
            <q-card flat class="col-6 text-center column">
                <q-card-section class="bg-light">
                    <div class="text-h6 text-semibold">Connect your wallet and Start earning points today!</div>
                </q-card-section>
                <q-card-section class="q-pt-none bg-light col-grow">
                    <p>So, are you ready to join this revolutionary journey and unlock the power of Libertai Points? Let's get started together and shape the future of decentralized cloud technology!</p>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>
  
<script>
import { defineComponent, ref } from 'vue'
import { useCounterStore } from '../stores/example-store'

export default defineComponent({
    name: 'PointsDetail',
    setup() {
        const counter = useCounterStore()
        // const count = ref(0)
        return { counter }
    }
})
</script>
  
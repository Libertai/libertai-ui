<template>
    <q-page class="flex flex-center bg-dark">
        <div class="row q-pa-xl q-col-gutter-md">
            <q-card flat class="col-12 text-center">
                <q-card-section class="bg-dark-page">
                    <p class="q-py-md">
                        <span class="text-white bg-primary q-py-sm q-px-xl rounded">{{ address }}</span>
                    </p>
                    <div class="text-h4 text-bold q-pb-sm">Your Libertai Points</div>
                    <p>Run aleph.im network nodes, stake ALEPH to continue earning Libertai points. New ways will be available soon!</p>
                </q-card-section>
                <q-card-section class="q-pt-none bg-dark-page">
                    <p class="text-h6 text-bold text-light">Total Points Received</p>

                    <p class="q-py-md">
                        <span class="text-h4 text-bold text-white bg-light q-py-sm q-px-xl rounded">{{ points.getAddressPoints(address).toFixed(2) }}</span>
                    </p>
                </q-card-section>
            </q-card>
            <q-card flat class="col-6 text-center column">
                <q-card-section class="bg-primary">
                    <p class="text-h6 text-bold text-white">Pending Points</p>
                    <p class="q-py-md">
                        <span class="text-h4 text-bold text-light bg-white q-py-sm q-px-xl rounded">{{ currentPendingPoints.toFixed(2) }}</span>
                    </p>
                    <p class="">
                        You are getting {{ hourlyRate.toFixed(2) }} points per hour.
                    </p>
                    
                </q-card-section>
            </q-card>
            <q-card flat class="col-6 text-center column">
                <q-card-section class="bg-primary">
                    <p class="text-h6 text-bold text-white">36 Month estimated Points*</p>
                    <p class="q-py-md">
                        <span class="text-h4 text-bold text-light bg-white q-py-sm q-px-xl rounded">{{ ThreeYearsPoints.toFixed(2) }}</span>
                    </p>
                </q-card-section>
            </q-card>
            <p class="text-grey text-center col-12">
                * Estimate only, and under current rules, if your participation stays at the same level. <br />
                The availability of Libertai Points is subject to change without notice. We may suspend, modify, or terminate the program at our sole discretion and without liability. Your participation does not guarantee that you will receive any specific amount of points or tokens.</p>
        </div>
    </q-page>
</template>
  
<script>
import { defineComponent, ref, watch, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { usePoints } from '../stores/points'
import { useAccount } from '../stores/account'
import { ethers } from "ethers";
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'PointsDetail',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const points = usePoints()
        const account = useAccount()
        // got address as an address part from vue router
        const address = ref(ethers.utils.getAddress(route.params.address))
        let interval = null

        onMounted(async () => {
            if (Object.keys(points.points).length === 0) {
                await points.update()
                await updatePoints()
            }
            interval = setInterval(() => {
                updatePoints()
            }, 1000)
        })

        onBeforeUnmount(() => {
            clearInterval(interval)
        })
        
        watch(
            () => route.params.address,
            async newAddress => {
                address.value = ethers.utils.getAddress(newAddress)
            }
        )
        watch(() => account.address,
            async (newAddress, oldAddress) => {
                console.log(address.value, oldAddress, newAddress)
                if(oldAddress == address.value) {
                    router.push({name: 'points-detail', params: {address: newAddress}})
                }
            }
        )

        const currentPendingPoints = ref(0)
        const hourlyRate = ref(0)
        async function updatePoints () {
            const pendingInfo = await points.getAddressRealtimePendingPointsInfo(address.value);
            hourlyRate.value = pendingInfo.hourlyRate;
            currentPendingPoints.value = pendingInfo.pending;
        }

        const ThreeYearsPoints = computed(() => {
            const currentTime = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
            const pendingPoints = points.getAddressPendingPoints(address.value);
            const currentPoints = points.getAddressPoints(address.value);
            const firstTime = points.info.first_time;
            const lastTime = points.info.last_time;
            const pendingTime = points.info.pending_time;
            const reward_start = points.info.reward_start;
            const totalDuration = pendingTime - lastTime;
            const currentDuration = currentTime - lastTime;
            const currentTimeSinceStart = currentTime - reward_start;
            const daily_decay = points.info.daily_decay;
            const initial_ratio = points.info.ratio;

            const current_decay = daily_decay ** (currentTimeSinceStart / 86400);
            const current_ratio = initial_ratio * current_decay;
            console.log(current_ratio)
            // we extrapolate on what would a 10 days distribution be
            let current_base = ((pendingPoints / totalDuration)*3600*24*10)/current_ratio;
            if (current_base < 0) {
                // something is fishy
                current_base = ((currentPoints / (lastTime-firstTime))*3600*24*10)/current_ratio;
            }
            console.log(current_base)


            const distributions = 365 * 3 / 10;
            let total = currentPoints;
            for (let i = 0; i < distributions; i++) {
                const time = reward_start + i * 10 * 24 * 3600;
                // if time is less than last time, we pass
                if (time < lastTime) {
                    continue;
                }
                // code in python:
                // days_since_start = (reward_time - settings['reward_start_ts']) / 86400
                // print(f"Processing rewards for {reward_time} ({days_since_start} days since start)")
                // decay = settings['daily_decay'] ** int((reward_time - settings['reward_start_ts']) / 86400)

                const days_since_start = (time - reward_start) / 86400
                const decay = daily_decay ** days_since_start;
                const ratio = initial_ratio * decay;
                total += current_base * ratio;
            }
            return total
        })

        

        // const count = ref(0)
        return { 
            points,
            address,
            currentPendingPoints,
            hourlyRate,
            ThreeYearsPoints
        }
    }
})
</script>
  
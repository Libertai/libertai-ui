<template>
  <div style="display: inline-block">
    <q-btn
      v-if="!account.active"
      class="text-semibold border-primary-highlight gt-sm"
      color="primary"
      no-caps
      rounded
      unelevated
      @click="eth_web3_login"
      no-caps
      icon="img:src/assets/wallet.svg"
    >
      Connect Wallet
    </q-btn>
    <q-btn-dropdown
      v-else
      :label="`${account.address.slice(0, 5)}...${account.address.slice(-5)}`"
      class="text-semibold border-primary-highlight gt-sm"
      color="primary"
      no-caps
      rounded
      unelevated
    >
      <div class="row no-wrap q-pa-md q-pt-none bg-primary border-primary-highlight">
        <div class="column items-center">
          <div class="text-small q-mb-xs">{{ account.address }}</div>

          <q-btn
            v-close-popup
            class="text-semibold border-primary-highlight gt-sm"
            color="secondary"
            label="Disconnect"
            no-caps
            rounded
            size="sm"
            unelevated
            @click="account.disconnect"
          />
        </div>
      </div>
    </q-btn-dropdown>
  </div>
</template>

<script setup>
import { ethers } from 'ethers';
import { useAccount } from '../stores/account';
import { usePoints } from 'stores/points';

console.log(ethers);

const account = useAccount();

async function eth_web3_login() {
  const points = usePoints();
  console.log(window.ethereum);
  if (window.ethereum) {
    try {
      // Request account access if needed
      await window.ethereum.enable();
      let provider = new ethers.providers.Web3Provider(window['ethereum'] || window.web3.currentProvider);
      await account.setProvider(provider);
    } catch (error) {
      console.log(error);
      // User denied account access...
    }
  } else {
    alert('No ethereum provider detected. Please install metamask or similar.');
  }
  console.log(account);
  if (!account.active) {
    alert('Error getting web3 account');
    return;
  }
  await points.update();
}
</script>

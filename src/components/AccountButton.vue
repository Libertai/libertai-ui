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
    >
      <q-icon class="text-dark" left size="xs">
        <img src="~assets/wallet.svg" />
      </q-icon>
      Connect Wallet
    </q-btn>
    <q-btn-dropdown
      v-else
      :label="`${account.address.slice(0, 4)}...${account.address.slice(-2)}`"
      class="border-primary-highlight gt-sm"
      icon="img:icons/svg/avatar.svg"
      no-caps
      rounded
      text-color="primary"
      unelevated
    >
      <div class="row no-wrap q-pa-md q-pt-none">
        <div class="column items-center">
          <div class="text-small q-mb-xs">{{ account.address }}</div>

          <q-btn
            v-close-popup
            class="text-semibold gt-sm"
            color="primary"
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
import { useAccount } from 'stores/account';
import { usePoints } from 'stores/points';

const account = useAccount();

async function eth_web3_login() {
  const points = usePoints();
  if (window.ethereum) {
    try {
      // Request account access if needed
      await window.ethereum.enable();
      let provider = new ethers.providers.Web3Provider(window['ethereum'] || window.web3.currentProvider);
      await account.setProvider(provider);
      await points.update();
    } catch (error) {
      // User denied account access...
    }
  } else {
    alert('No ethereum provider detected. Please install metamask or similar.');
  }
  if (!account.active) {
    alert('Error getting web3 account');
  }
}
</script>

<template>
  <div style="display: inline-block">
    <q-btn-dropdown v-if="!account.isConnected.value" color="primary" label="Connect wallet" no-caps rounded unelevated>
      <q-btn
        v-for="connector in config.connectors"
        :key="connector.uid"
        class="row tw-mx-auto"
        no-caps
        rounded
        unelevated
        @click="connect({ connector })"
      >
        <ltai-icon :name="getConnectorIconName(connector.id)" class="tw-mr-1" />
        <span>{{ connector.name }}</span>
      </q-btn>
    </q-btn-dropdown>
    <q-btn-dropdown
      v-else
      :label="`${account.address.value?.slice(0, 4)}...${account.address.value?.slice(-2)}`"
      class="border-primary-highlight gt-sm"
      icon="img:icons/avatar.svg"
      no-caps
      rounded
      text-color="primary"
      unelevated
    >
      <div class="row no-wrap q-pa-md q-pt-none">
        <div class="column items-center">
          <div class="text-small tw-mb-1">{{ account.address.value }}</div>

          <q-btn
            v-close-popup
            class="text-semibold gt-sm"
            color="primary"
            label="Disconnect"
            no-caps
            rounded
            size="sm"
            unelevated
            @click="disconnect()"
          />
        </div>
      </div>
    </q-btn-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { useAccountStore } from 'stores/account';
import { useAccount, useConnect, useDisconnect } from '@wagmi/vue';
import { watchAccount } from '@wagmi/vue/actions';
import { config } from 'src/config/wagmi';
import { watchEffect } from 'vue';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';

const accountStore = useAccountStore();

const account = useAccount();
const { connect } = useConnect();
const { disconnect } = useDisconnect();

if (account.isConnected.value) {
  accountStore.onAccountChange();
}

watchEffect((onCleanup) => {
  const unwatch = watchAccount(config, {
    async onChange(newAccount) {
      if (newAccount.address === undefined) {
        accountStore.onDisconnect();
        return;
      }

      await accountStore.onAccountChange();
    },
  });
  onCleanup(unwatch);
});

const getConnectorIconName = (connectorId: string): string => {
  switch (connectorId) {
    case 'io.rabby':
      return 'svguse:icons.svg#rabby';
    case 'io.metamask':
      return 'svguse:icons.svg#metamask';
    case 'walletConnect':
      return 'svguse:icons.svg#walletConnect';
    default:
      return 'svguse:icons.svg#wallet';
  }
};
</script>

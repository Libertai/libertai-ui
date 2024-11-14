<template>
  <div style="display: inline-block">
    <wallet-modal-provider :dark="!!$q.dark.mode" container="body">
      <template #default="modalScope">
        <slot v-bind="modalScope">
          <q-btn ref="openSolanaModal" class="tw-hidden" @click="modalScope.openModal" />
        </slot>
      </template>
    </wallet-modal-provider>

    <q-btn-dropdown
      v-if="accountStore.account === null"
      auto-close
      color="primary"
      label="Connect wallet"
      no-caps
      rounded
      unelevated
    >
      <q-btn
        v-for="connector in config.connectors"
        :key="connector.uid"
        class="row tw-mx-auto"
        no-caps
        rounded
        unelevated
        @click="wagmiConnect({ connector })"
      >
        <ltai-icon :name="getConnectorIconName(connector.id)" class="tw-mr-1" />
        <span>{{ connector.name }}</span>
      </q-btn>
      <q-btn
        key="solana"
        class="row tw-mx-auto"
        no-caps
        rounded
        unelevated
        @click="($refs.openSolanaModal as HTMLButtonElement).click()"
      >
        <ltai-icon :name="getConnectorIconName('solana')" class="tw-mr-1" />
        <span>Solana</span>
      </q-btn>
    </q-btn-dropdown>
    <q-btn-dropdown
      v-else
      :label="`${accountStore.account.address?.slice(0, 4)}...${accountStore.account.address?.slice(-2)}`"
      class="border-primary-highlight gt-sm"
      icon="img:icons/avatar.svg"
      no-caps
      rounded
      text-color="primary"
      unelevated
    >
      <div class="row no-wrap q-pa-md q-pt-none">
        <div class="column items-center">
          <div class="text-small tw-mb-1">{{ accountStore.account.address }}</div>

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
import { useAccount, useConnect, useDisconnect } from '@wagmi/vue';
import { watchAccount } from '@wagmi/vue/actions';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import { useWallet, WalletModalProvider } from 'solana-wallets-vue';
import { config } from 'src/config/wagmi';
import { useAccountStore } from 'stores/account';
import { watch, watchEffect } from 'vue';

const accountStore = useAccountStore();

// wagmi
const wagmiAccount = useAccount();
const { connect: wagmiConnect } = useConnect();
const { disconnect: wagmiDisconnect } = useDisconnect();

// solana
const { publicKey: solanaPubKey, disconnect: solanaDisconnect } = useWallet();

// wagmi account already connected
if (wagmiAccount.isConnected.value) {
  accountStore.onAccountChange({ address: wagmiAccount.address.value!, chain: 'base' });
}
// solana account already connected
if (solanaPubKey.value !== null) {
  accountStore.onAccountChange({ address: solanaPubKey.value.toBase58(), chain: 'solana' });
}

// watching wagmi account changes
watchEffect((onCleanup) => {
  const unwatch = watchAccount(config, {
    async onChange(newAccount) {
      if (newAccount.address === undefined) {
        if (accountStore.account?.chain !== 'solana') {
          accountStore.onDisconnect();
        }
        return;
      }

      await accountStore.onAccountChange({ address: newAccount.address, chain: 'base' });
    },
  });
  onCleanup(unwatch);
});

// watching solana account changes
watch(
  () => solanaPubKey.value,
  (newValue) => {
    if (newValue === null) {
      accountStore.onDisconnect();
    } else if (newValue.toBase58() !== accountStore.account?.address) {
      accountStore.onAccountChange({ address: newValue.toBase58(), chain: 'solana' });
    }
  },
);

const getConnectorIconName = (connectorId: string): string => {
  switch (connectorId) {
    case 'io.rabby':
      return 'svguse:icons.svg#rabby';
    case 'io.metamask':
      return 'svguse:icons.svg#metamask';
    case 'walletConnect':
      return 'svguse:icons.svg#walletConnect';
    case 'solana':
      return 'svguse:icons.svg#solana';
    default:
      return 'svguse:icons.svg#wallet';
  }
};

const disconnect = () => {
  const account = accountStore.account;

  if (account === null) {
    return;
  }

  switch (account.chain) {
    case 'base':
      wagmiDisconnect();
      break;
    case 'solana':
      solanaDisconnect();
      break;
  }
  accountStore.onDisconnect();
};
</script>

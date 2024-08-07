<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent q-mt-sm">
      <q-toolbar>
        <q-btn aria-label="Menu" color="primary" dense flat icon="menu" round @click="toggleLeftDrawer" />

        <q-btn class="tw-p-1" flat @click="showUserSettingsDialog = true">
          <q-icon size="xs">
            <img :src="`icons/svg/settings${$q.dark.mode ? '_lighten' : ''}.svg`" alt="settings" />
          </q-icon>
        </q-btn>
        <user-settings-dialog v-model="showUserSettingsDialog" />

        <q-space />

        <div class="row q-gutter-x-sm">
          <q-btn
            v-if="!account.isConnected.value"
            :class="$q.screen.gt.sm ? '' : 'float-right q-pa-sm'"
            :icon="`img:icons/svg/star${$q.dark.mode ? '_lighten' : ''}.svg`"
            :label="$q.screen.gt.sm ? 'Earn $LTAI' : ''"
            no-caps
            rounded
            text-color="primary"
            to="/tokens"
            unelevated
          />
          <q-btn
            v-else
            :class="$q.screen.gt.sm ? 'btn-gradient' : 'float-right q-pa-sm'"
            :icon="$q.screen.gt.sm ? undefined : 'img:icons/svg/star.svg'"
            :text-color="$q.screen.gt.sm ? 'white' : 'black'"
            :to="{
              name: 'tokens-detail',
              params: { address: account.address.value },
            }"
            no-caps
            rounded
            unelevated
          >
            <span :key="account.address.value"
              >{{ accountStore.ltaiBalance.toFixed(0) }} <span v-if="$q.screen.gt.sm">$LTAI</span></span
            >
          </q-btn>
          <account-button />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" class="flex-grow fit tw-flex tw-flex-col" show-if-above>
      <!-- image link with the logo -->
      <q-item class="q-mb-md text-left" clickable to="/">
        <img :src="`icons/svg/libertai_full${$q.dark.mode ? '_lighten' : ''}.svg`" alt="LibertAI" />
      </q-item>
      <div class="q-mr-xl q-ml-md q-mt-md">
        <q-btn class="border-primary-highlight" no-caps rounded text-color="dark-mode-text" to="/new" unelevated>
          <q-icon class="text-dark" left size="xs">
            <img alt="new chat" src="/icons/svg/chat-plus.svg" />
          </q-icon>
          New Chat
        </q-btn>
      </div>

      <chats-list />

      <q-item to="/persona-management">
        <img :src="`icons/svg/robot${$q.dark.mode ? '_lighten' : ''}.svg`" alt="persona" />

        <q-item-section class="q-pl-sm">
          <span>Persona management</span>
        </q-item-section>
      </q-item>

      <!-- socials and support links (follow us, support, disclaimer) -->
      <q-list class="q-pt-md flex">
        <q-item class="q-mx-auto" href="https://x.com/libertai_dai" target="_blank">
          <q-item-section avatar>
            <img alt="Twitter - X" src="/icons/twitter-x.svg" width="32px" />
          </q-item-section>
        </q-item>
        <q-item class="q-mx-auto" href="https://t.me/libertai" target="_blank">
          <q-item-section avatar>
            <img alt="Telegram" src="/icons/telegram.svg" width="32px" />
          </q-item-section>
        </q-item>
        <q-item class="q-mx-auto" href="https://aleph.im" target="_blank">
          <q-item-section avatar>
            <img alt="Aleph" src="/icons/aleph.svg" width="32px" />
          </q-item-section>
        </q-item>
      </q-list>
      <!-- powered by aleph.im -->
      <q-item clickable href="https://aleph.im" target="_blank">
        <img :src="`icons/svg/powered-by${$q.dark.mode ? '_lighten' : ''}.svg`" alt="aleph.im" />
      </q-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import AccountButton from 'src/components/AccountButton.vue';
import UserSettingsDialog from 'components/dialog/UserSettingsDialog.vue';
import { useAccount } from '@wagmi/vue';
import { useAccountStore } from 'stores/account';
import ChatsList from 'components/ChatsList.vue';

const leftDrawerOpen = ref(false);
const showUserSettingsDialog = ref(false);

// Setup Stores
const accountStore = useAccountStore();

const account = useAccount();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

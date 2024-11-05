<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent q-mt-sm">
      <q-toolbar>
        <q-btn
          aria-label="Menu"
          color="primary"
          dense
          flat
          icon="menu"
          round
          @click="generalStore.isSidebarOpen = !generalStore.isSidebarOpen"
        />

        <q-space />

        <div class="row q-gutter-x-sm">
          <q-btn
            v-if="accountStore.account === null"
            :class="{ 'float-right q-pa-sm': !$q.screen.gt.sm }"
            no-caps
            rounded
            text-color="primary"
            to="/tokens"
            unelevated
          >
            <ltai-icon :left="$q.screen.gt.sm" name="svguse:icons.svg#tokens-star" />
            <span v-if="$q.screen.gt.sm">Earn $LTAI</span>
          </q-btn>
          <q-btn
            v-else
            :class="[$q.screen.gt.sm ? 'btn-gradient' : 'float-right q-pa-sm']"
            :text-color="$q.screen.gt.sm ? 'white' : 'black'"
            :to="
              accountStore!.account.chain === 'base'
                ? {
                    name: 'tokens-detail',
                    params: { address: accountStore!.account.address },
                  }
                : undefined
            "
            no-caps
            rounded
            unelevated
          >
            <ltai-icon v-if="!$q.screen.gt.sm" left name="svguse:icons.svg#tokens-star" />
            <span :key="accountStore!.account.address"
              >{{ accountStore.ltaiBalance.toFixed(0) }} <span v-if="$q.screen.gt.sm">$LTAI</span></span
            >
          </q-btn>
          <account-button />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="generalStore.isSidebarOpen" class="flex-grow fit tw-flex tw-flex-col" show-if-above>
      <!-- image link with the logo -->
      <q-item class="q-mb-md text-left" clickable to="/">
        <img :src="`icons/libertai_full${$q.dark.mode ? '_lighten' : ''}.svg`" alt="LibertAI" />
      </q-item>
      <div class="q-mr-xl q-ml-md q-mt-md">
        <q-btn class="border-primary-highlight" no-caps rounded text-color="dark-mode-text" to="/new" unelevated>
          <ltai-icon left name="svguse:icons.svg#chat-plus" size="xs" />
          New Chat
        </q-btn>
      </div>

      <chats-list />

      <div class="tw-mb-5">
        <q-item v-for="item in sidebarItems" :key="item.link" :to="item.link">
          <q-item-section class="tw-flex tw-flex-row tw-justify-start tw-items-center">
            <ltai-icon :name="item.icon" class="tw-w-6 tw-h-6 tw-block" />
            <p class="tw-pl-2">{{ item.title }}</p>
          </q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import ChatsList from 'components/ChatsList.vue';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import AccountButton from 'src/components/AccountButton.vue';
import { useAccountStore } from 'stores/account';
import { useGeneralStore } from 'stores/general';

const accountStore = useAccountStore();
const generalStore = useGeneralStore();

const sidebarItems = [
  {
    link: '/agents',
    icon: 'svguse:icons.svg#agents',
    title: 'Agents (private beta)',
  },
  {
    link: '/subscriptions',
    icon: 'svguse:icons.svg#subscription-star',
    title: 'Subscriptions',
  },
  {
    link: '/knowledge-base',
    icon: 'svguse:icons.svg#book',
    title: 'Knowledge base',
  },
  {
    link: '/persona-management',
    icon: 'svguse:icons.svg#robot',
    title: 'Persona management',
  },
  {
    link: '/account',
    icon: 'svguse:icons.svg#account',
    title: 'Account settings',
  },
];
</script>

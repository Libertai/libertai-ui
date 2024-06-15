<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent q-mt-sm">
      <q-toolbar>
        <q-btn aria-label="Menu" color="primary" dense flat icon="menu" round @click="toggleLeftDrawer" />

        <q-btn class="q-pa-xs" flat @click="showUserSettingsDialog = true">
          <q-icon size="xs">
            <img :src="`icons/svg/settings${$q.dark.mode ? '_lighten' : ''}.svg`" alt="settings" />
          </q-icon>
        </q-btn>
        <user-settings-dialog v-model="showUserSettingsDialog" />

        <toggle-theme />
        <q-space />

        <div class="row q-gutter-x-sm">
          <q-btn
            v-if="!account.isConnected.value"
            :class="$q.screen.gt.sm ? '' : 'float-right q-pa-sm'"
            :icon="`img:icons/svg/star${$q.dark.mode ? '_lighten' : ''}.svg`"
            :label="$q.screen.gt.sm ? 'Earn Points' : ''"
            no-caps
            rounded
            text-color="primary"
            to="/points"
            unelevated
          />
          <q-btn
            v-else
            :class="$q.screen.gt.sm ? 'btn-gradient' : 'float-right q-pa-sm'"
            :icon="$q.screen.gt.sm ? undefined : 'img:icons/svg/star.svg'"
            :text-color="$q.screen.gt.sm ? 'white' : 'black'"
            :to="{
              name: 'points-detail',
              params: { address: account.address.value },
            }"
            no-caps
            rounded
            unelevated
          >
            <span :key="account.address.value"
              >{{ addressPoints.toFixed(0) }} <span v-if="$q.screen.gt.sm">Points</span></span
            >
          </q-btn>
          <!-- model selector -->
          <model-selector />
          <account-button />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" class="flex-grow fit tw-flex tw-flex-col" show-if-above>
      <!-- image link with the logo -->
      <q-item class="q-mb-md text-left" clickable to="/">
        <img :src="`icons/svg/libertai_full${$q.dark.mode ? '_lighten' : ''}.svg`" alt="Libertai" />
      </q-item>
      <div class="q-mr-xl q-ml-md q-mt-md">
        <q-btn class="border-primary-highlight" no-caps rounded text-color="dark-mode-text" to="/new" unelevated>
          <q-icon class="text-dark" left size="xs">
            <img alt="new chat" src="/icons/svg/chat-plus.svg" />
          </q-icon>
          New Chat
        </q-btn>
      </div>
      <!-- list of chats by reference to the chats-store -->
      <q-list class="q-mt-md" style="flex-grow: 1">
        <q-scroll-area style="height: 100%; min-height: 100px" visible>
          <q-item
            v-for="chat of (chats as any[]).slice().reverse()"
            :key="chat.id"
            :to="`/chat/${chat.id}`"
            class="q-mx-md rounded-borders q-py-md q-my-md item-history"
            exact
            exact-active-class="bg-secondary item-active"
          >
            <q-item-section side>
              <q-btn
                v-if="route.params?.id === chat.id"
                class="q-pa-xs"
                flat
                icon="img:icons/svg/msg_active.svg"
                size="sm"
              >
              </q-btn>
              <q-btn
                v-if="route.params?.id !== chat.id"
                :icon="`img:icons/svg/msg${$q.dark.mode ? '_lighten' : ''}.svg`"
                class="q-pa-xs"
                flat
                size="sm"
              >
              </q-btn>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-caption ellipsis-2-lines">
                {{ chat.title }}
              </q-item-label>
            </q-item-section>

            <q-item-section v-if="route.params?.id === chat.id" side>
              <q-btn-group dense flat>
                <q-btn
                  class="q-pa-xs"
                  icon="img:icons/delete.svg"
                  size="sm"
                  @_click="deleteChat(chat.id)"
                  @click="deleteChatConfirm(chat.id)"
                >
                  <q-tooltip>Delete chat</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-item-section>
          </q-item>
        </q-scroll-area>
        <q-dialog v-model="deleteChatConfirmAction">
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar color="primary" icon="delete" text-color="white" />
              <span class="q-ml-xl">Are you sure you want to delete the current chat conversation?</span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                v-close-popup
                class="border-primary-highlight"
                label="Cancel"
                rounded
                text-color="dark-mode-text"
              />
              <q-btn v-close-popup color="primary" label="Confirm" rounded @click="deleteChat(deleteChatId!)" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-list>

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
import { computed, nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';

// Import State
import { useChatsStore } from 'stores/chats-store';
import { usePointsStore } from 'src/stores/points';
import { useRoute, useRouter } from 'vue-router';

// Import Components
import AccountButton from 'src/components/AccountButton.vue';
import ModelSelector from 'src/components/ModelSelector.vue';
import UserSettingsDialog from 'components/UserSettingsDialog.vue';
import { useAccount } from '@wagmi/vue';
import ToggleTheme from 'components/ToggleTheme.vue';

const leftDrawerOpen = ref(false);
// Control whether the advanced persona customization is shown
const showUserSettingsDialog = ref(false);

const deleteChatConfirmAction = ref(false);
const deleteChatId = ref<string | null>(null);

// Setup Stores
const chatsStore = useChatsStore();
const points = usePointsStore();

const account = useAccount();

const router = useRouter();
const route = useRoute();

// Reference to the chat-store state
const { chats } = storeToRefs(chatsStore);

const addressPoints = computed(() => {
  if (account.isConnected.value) {
    return points.getAddressRealtimePoints(account.address.value);
  } else {
    return 0;
  }
});

// Delete a chat
async function deleteChat(chatId: string) {
  await chatsStore.deleteChat(chatId);
  if (route.params?.id === chatId) {
    nextTick(() => router.push('/new'));
  }
}

async function deleteChatConfirm(chatId: string) {
  deleteChatConfirmAction.value = true;
  deleteChatId.value = chatId;
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

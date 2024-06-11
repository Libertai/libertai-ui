<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent q-mt-sm">
      <q-toolbar>
        <q-btn aria-label="Menu" color="primary" dense flat icon="menu" round @click="toggleLeftDrawer" />
        <q-btn class="q-pa-xs" flat @click="editPersona = true">
          <q-icon size="xs">
            <img :src="`icons/svg/settings${$q.dark.mode ? '_lighten' : ''}.svg`" alt="settings" />
          </q-icon>
        </q-btn>
        <persona-dialog v-model="editPersona" />
        <toggle-theme />
        <q-space />

        <div class="row q-gutter-x-sm">
          <q-btn
            v-if="!account.active"
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
              params: { address: account.address },
            }"
            no-caps
            rounded
            unelevated
          >
            <span :key="account.address"
              >{{ addressPoints.toFixed(0) }} <span v-if="$q.screen.gt.sm">Points</span></span
            >
          </q-btn>
          <!-- model selector -->
          <model-selector />
          <account-button />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      class="flex-grow fit"
      show-if-above
      style="display: flex; flex-direction: column"
    >
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
            v-for="chat of chats.slice().reverse()"
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
              <q-btn v-close-popup color="primary" flat label="Cancel" />
              <q-btn v-close-popup color="primary" flat label="Confirm" @click="deleteChat(deleteChatId)" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-list>

      <q-item to="/persona">
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

<script setup>
import { computed, nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';

// Import State
import { useChatsStore } from '../stores/chats-store';
import { useAccountStore } from '../stores/account';
import { usePoints } from 'src/stores/points';
import { useRoute, useRouter } from 'vue-router';

// Import Components
import AccountButton from 'src/components/AccountButton.vue';
import PersonaDialog from 'src/components/PersonaDialog.vue';
import ToggleTheme from 'src/components/ToggleTheme.vue';
import ModelSelector from 'src/components/ModelSelector.vue';

const leftDrawerOpen = ref(false);
// Control whether the advanced persona customization is shown
const editPersona = ref(false);

const deleteChatConfirmAction = ref(false);
const deleteChatId = ref(null);

// Setup Stores
const chatsStore = useChatsStore();
const account = useAccountStore();
const points = usePoints();

const router = useRouter();
const route = useRoute();

// Reference to the chat-store state
const { chats } = storeToRefs(chatsStore);

const addressPoints = computed(() => {
  if (account.active) {
    return points.getAddressRealtimePoints(account.address);
  } else {
    return 0;
  }
});

// Delete a chat
async function deleteChat(chat_id) {
  await chatsStore.deleteChat(chat_id);
  if (route.params?.id == chat_id) {
    nextTick(() => router.push('/new'));
  }
}

async function deleteChatConfirm(chat_id) {
  deleteChatConfirmAction.value = true;
  deleteChatId.value = chat_id;
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

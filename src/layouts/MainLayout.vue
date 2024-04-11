<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-space />

        <div class="row q-gutter-x-sm">
          <q-btn
            unelevated
            rounded
            color="white"
            text-color="primary"
            no-caps
            class="text-semibold"
            label="Earn Points"
            to="/points"
            v-if="!account.active"
          />
          <q-btn
            unelevated
            rounded
            color="white"
            text-color="primary"
            no-caps
            class="text-semibold"
            :to="{
              name: 'points-detail',
              params: { address: account.address },
            }"
            v-else
          >
            <span :key="account.address">{{ addressPoints.toFixed(0) }} Points</span>
          </q-btn>
          <!-- model selector -->
          <q-btn-dropdown
            :label="modelsStore.selectedModel.name"
            color="primary"
            text-color="white"
            class="text-semibold border-primary-highlight"
            rounded
            unelevated
            no-caps
          >
            <q-list>
              <q-item
                clickable
                v-close-popup
                v-for="model in modelsStore.models"
                :key="model.id"
                @click="modelsStore.setModel(model)"
              >
                <q-item-section>
                  <q-item-label>
                    {{ model.name }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <account-button />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      class="bg-secondary flex-grow"
      style="display: flex; flex-direction: column"
    >
      <!-- image link with the logo -->
      <q-item clickable to="/" class="q-mb-md">
        <img src="~assets/libertai.svg" alt="Libertai" />
      </q-item>
      <q-btn
        color="primary"
        class="q-mx-md q-my-lg text-semibold border-primary-highlight"
        rounded
        unelevated
        no-caps
        to="/new"
        >New Chat</q-btn
      >
      <!-- list of chats by reference to the chats-store -->
      <q-list style="flex-grow: 1" dense>
        <q-item-label header class="text-uppercase text-bold"> Chats </q-item-label>
        <q-item
          v-for="chat of chats.slice().reverse()"
          :key="chat.id"
          :to="`/chat/${chat.id}`"
          exact
          exact-active-class="bg-dark"
          class="text-white q-mx-md rounded-borders"
        >
          <q-item-section>
            <q-item-label>
              {{ chat.title }}
            </q-item-label>
          </q-item-section>

          <q-item-section side v-if="route.params?.id == chat.id">
            <q-btn-group flat dense>
              <q-btn icon="delete" size="sm" class="q-pa-xs" @click="deleteChat(chat.id)">
                <q-tooltip>Delete chat</q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-item-section>
        </q-item>
      </q-list>
      <!-- socials and support links (follow us, support, disclaimer) -->
      <q-list class="q-pt-md">
        <q-separator />

        <q-item href="https://twitter.com/libertai_dai" target="_blank">
          <q-item-section avatar>
            <q-icon name="bi-twitter-x" />
          </q-item-section>

          <q-item-section>
            <q-item-label> Follow us </q-item-label>
          </q-item-section>
        </q-item>
        <q-item href="https://t.me/libertai" target="_blank">
          <q-item-section avatar>
            <q-icon name="bi-telegram" />
          </q-item-section>

          <q-item-section>
            <q-item-label> Chat with us </q-item-label>
          </q-item-section>
        </q-item>
        <!-- powered by aleph.im -->
        <q-item clickable href="https://aleph.im" target="_blank">
          <img src="~assets/powered-by.svg" alt="aleph.im" />
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, watch, computed, nextTick } from 'vue';
import { storeToRefs } from 'pinia';

// Import State
import { useChatsStore } from '../stores/chats-store';
import { useModelsStore } from '../stores/models-store';
import { useAccount } from '../stores/account';
import { usePoints } from 'src/stores/points';
import { useRouter, useRoute } from 'vue-router';

// IMport Components
import AccountButton from 'src/components/AccountButton.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    AccountButton,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    // Setup Stores
    const modelsStore = useModelsStore();
    const chatsStore = useChatsStore();
    const account = useAccount();
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

    // TODO: this is an invalid use of watch, as we are watching a computed value
    // watch for account changes, and update points if not already done
    watch(account.address, () => {
      if (account.active && Object.keys(points.points).length === 0) {
        points.update();
      }
    });

    // Delete a chat
    async function deleteChat(chat_id) {
      await chatsStore.deleteChat(chat_id);
      if (route.params?.id == chat_id) {
        nextTick(() => router.push('/new'));
      }
    }

    return {
      chats,
      modelsStore,
      account,
      points,
      router,
      route,
      leftDrawerOpen,
      addressPoints,
      deleteChat,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

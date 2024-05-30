<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent q-mt-sm">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" color="primary" />
        <!--<persona-drop-down />-->
        <q-btn flat @click="editPersona = true">
          <q-icon size="xs">
            <img src="icons/svg/settings.svg" />
          </q-icon>
        </q-btn>
        <persona-dialog v-model="editPersona" />
        <q-space />

        <div class="row q-gutter-x-sm">
          <!-- model selector -->
          <q-btn-dropdown
            :label="modelsStore.selectedModel.name.substring(0, 12) + '..'"
            color="primary"
            text-color="white"
            class="border-primary-highlight"
            rounded
            unelevated
            no-caps
            :icon="$q.screen.gt.sm ? 'img:icons/svg/engine.svg' : ''"
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
          <q-btn
            unelevated
            rounded
            text-color="white"
            no-caps
            :class="$q.screen.gt.sm ? 'btn-gradient' : 'float-right q-pa-sm'"
            :label="$q.screen.gt.sm ? 'Earn Points' : ''"
            :icon="$q.screen.gt.sm ? '' : 'img:icons/svg/star.svg'"
            to="/points"
            v-if="!account.active"
          />
          <q-btn
            unelevated
            rounded
            :text-color="$q.screen.gt.sm ? 'white' : 'black'"
            :class="$q.screen.gt.sm ? 'btn-gradient' : 'float-right q-pa-sm'"
            :icon="$q.screen.gt.sm ? '' : 'img:icons/svg/star.svg'"
            no-caps
            :to="{
              name: 'points-detail',
              params: { address: account.address },
            }"
            v-else
          >
            <span :key="account.address"
              >{{ addressPoints.toFixed(0) }} <span v-if="$q.screen.gt.sm">Points</span></span
            >
          </q-btn>
          <account-button />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      class="bg-white flex-grow fit"
      style="display: flex; flex-direction: column"
    >
      <!-- image link with the logo -->
      <q-item clickable to="/" class="q-mb-md text-left">
        <img src="~assets/libertai.svg" alt="Libertai" />
      </q-item>
      <q-btn
        color="primary"
        class="q-mx-md q-my-lg q-py-lg rounded-borders vertical-middle"
        align="left"
        unelevated
        no-caps
        to="/new"
        >+ New Chat</q-btn
      >

      <!-- list of chats by reference to the chats-store -->
      <q-list style="flex-grow: 1">
        <q-scroll-area visible style="height: 100%; min-height: 100px">
          <q-item
            v-for="chat of chats.slice().reverse()"
            :key="chat.id"
            :to="`/chat/${chat.id}`"
            exact
            exact-active-class="bg-secondary item-active"
            class="q-mx-md rounded-borders q-py-md q-my-md item-history"
          >
            <q-item-section side>
              <q-btn v-if="route.params?.id == chat.id" flat icon="img:icons/msg_active.svg" size="sm" class="q-pa-xs">
              </q-btn>
              <q-btn v-if="route.params?.id != chat.id" flat icon="img:icons/msg.svg" size="sm" class="q-pa-xs">
              </q-btn>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-caption ellipsis-2-lines">
                {{ chat.title }}
              </q-item-label>
            </q-item-section>

            <q-item-section side v-if="route.params?.id == chat.id">
              <q-btn-group flat dense>
                <q-btn
                  icon="img:icons/delete.svg"
                  size="sm"
                  class="q-pa-xs"
                  @click="deleteChatConfirm(chat.id)"
                  @_click="deleteChat(chat.id)"
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
              <q-avatar icon="delete" color="primary" text-color="white" />
              <span class="q-ml-xl">Are you sure you want to delete the current chat conversation?</span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="primary" v-close-popup />
              <q-btn flat label="Confirm" color="primary" v-close-popup @click="deleteChat(deleteChatId)" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-list>
      <!-- socials and support links (follow us, support, disclaimer) -->
      <q-list class="q-pt-md">
        <q-item href="https://twitter.com/libertai_dai" target="_blank">
          <q-item-section avatar>
            <img src="icons/twitter-x.svg" alt="Twitter - X" width="32px" />
          </q-item-section>

          <q-item-section>
            <q-item-label> Follow us </q-item-label>
          </q-item-section>
        </q-item>
        <q-item href="https://t.me/libertai" target="_blank">
          <q-item-section avatar>
            <img src="icons/telegram.svg" alt="Telegram" width="32px" />
          </q-item-section>

          <q-item-section>
            <q-item-label> Chat with us </q-item-label>
          </q-item-section>
        </q-item>
        <q-item href="https://aleph.im" target="_blank">
          <q-item-section avatar>
            <img src="icons/aleph.svg" alt="Aleph" width="32px" />
          </q-item-section>

          <q-item-section>
            <q-item-label> Build with us </q-item-label>
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
import { usePersonasStore } from 'src/stores/personas-store';
import { useAccount } from '../stores/account';
import { usePoints } from 'src/stores/points';
import { useRouter, useRoute } from 'vue-router';

// IMport Components
import AccountButton from 'src/components/AccountButton.vue';
import PersonaDialog from 'src/components/PersonaDialog.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    AccountButton,
    PersonaDialog,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    // Control whether the advanced persona customization is shown
    const editPersona = ref(false);

    const deleteChatConfirmAction = ref(false);
    const deleteChatId = ref(null);

    // Setup Stores
    const modelsStore = useModelsStore();
    const chatsStore = useChatsStore();
    const personasStore = usePersonasStore();
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

    async function deleteChatConfirm(chat_id) {
      deleteChatConfirmAction.value = true;
      deleteChatId.value = chat_id;
    }

    return {
      chats,
      modelsStore,
      personasStore,
      account,
      points,
      router,
      route,
      leftDrawerOpen,
      addressPoints,
      deleteChat,
      deleteChatConfirm,
      deleteChatConfirmAction,
      deleteChatId,
      editPersona,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

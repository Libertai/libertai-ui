<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent q-mt-sm">
      <q-toolbar>
        <q-btn aria-label="Menu" color="primary" dense flat icon="menu" round @click="toggleLeftDrawer" />
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
            :icon="$q.screen.gt.sm ? 'img:icons/svg/engine.svg' : ''"
            :label="modelsStore.selectedModel.name.substring(0, 12) + '..'"
            class="border-primary-highlight"
            color="primary"
            no-caps
            rounded
            text-color="white"
            unelevated
          >
            <q-list>
              <q-item
                v-for="model in modelsStore.models"
                :key="model.id"
                v-close-popup
                clickable
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
            v-if="!account.active"
            :class="$q.screen.gt.sm ? 'btn-gradient' : 'float-right q-pa-sm'"
            :icon="$q.screen.gt.sm ? '' : 'img:icons/svg/star.svg'"
            :label="$q.screen.gt.sm ? 'Earn Points' : ''"
            no-caps
            rounded
            text-color="white"
            to="/points"
            unelevated
          />
          <q-btn
            v-else
            :class="$q.screen.gt.sm ? 'btn-gradient' : 'float-right q-pa-sm'"
            :icon="$q.screen.gt.sm ? '' : 'img:icons/svg/star.svg'"
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
          <account-button />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      class="bg-white flex-grow fit"
      show-if-above
      style="display: flex; flex-direction: column"
    >
      <!-- image link with the logo -->
      <q-item class="q-mb-md text-left" clickable to="/">
        <img alt="Libertai" src="~assets/libertai.svg" />
      </q-item>
      <q-btn
        align="left"
        class="q-mx-md q-my-lg q-py-lg rounded-borders vertical-middle"
        color="primary"
        no-caps
        to="/new"
        unelevated
        >+ New Chat
      </q-btn>

      <!-- list of chats by reference to the chats-store -->
      <q-list style="flex-grow: 1">
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
              <q-btn v-if="route.params?.id == chat.id" class="q-pa-xs" flat icon="img:icons/msg_active.svg" size="sm">
              </q-btn>
              <q-btn v-if="route.params?.id != chat.id" class="q-pa-xs" flat icon="img:icons/msg.svg" size="sm">
              </q-btn>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-caption ellipsis-2-lines">
                {{ chat.title }}
              </q-item-label>
            </q-item-section>

            <q-item-section v-if="route.params?.id == chat.id" side>
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
      <!-- socials and support links (follow us, support, disclaimer) -->
      <q-list class="q-pt-md">
        <q-item href="https://twitter.com/libertai_dai" target="_blank">
          <q-item-section avatar>
            <img alt="Twitter - X" src="icons/twitter-x.svg" width="32px" />
          </q-item-section>

          <q-item-section>
            <q-item-label> Follow us</q-item-label>
          </q-item-section>
        </q-item>
        <q-item href="https://t.me/libertai" target="_blank">
          <q-item-section avatar>
            <img alt="Telegram" src="icons/telegram.svg" width="32px" />
          </q-item-section>

          <q-item-section>
            <q-item-label> Chat with us</q-item-label>
          </q-item-section>
        </q-item>
        <q-item href="https://aleph.im" target="_blank">
          <q-item-section avatar>
            <img alt="Aleph" src="icons/aleph.svg" width="32px" />
          </q-item-section>

          <q-item-section>
            <q-item-label> Build with us</q-item-label>
          </q-item-section>
        </q-item>
        <!-- powered by aleph.im -->
        <q-item clickable href="https://aleph.im" target="_blank">
          <img alt="aleph.im" src="~assets/powered-by.svg" />
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

// Import State
import { useChatsStore } from '../stores/chats-store';
import { useModelsStore } from '../stores/models-store';
import { usePersonasStore } from 'src/stores/personas-store';
import { useAccount } from '../stores/account';
import { usePoints } from 'src/stores/points';
import { useRoute, useRouter } from 'vue-router';

// Import Components
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

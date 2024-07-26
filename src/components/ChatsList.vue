<template>
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
          <q-btn v-if="route.params?.id === chat.id" class="tw-p-1" flat icon="img:icons/svg/msg_active.svg" size="sm">
          </q-btn>
          <q-btn
            v-if="route.params?.id !== chat.id"
            :icon="`img:icons/svg/msg${$q.dark.mode ? '_lighten' : ''}.svg`"
            class="tw-p-1"
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
          <q-btn-dropdown
            :class="`tw-p-1 ${$q.dark.mode ? 'tw-text-black' : ''}`"
            dropdown-icon="more_horiz"
            unelevated
          >
            <q-list>
              <q-item v-close-popup clickable @click="deleteChatConfirm(chat.id)">
                <q-item-section avatar>
                  <q-avatar :icon="`img:icons/delete${$q.dark.mode ? '_lighten' : ''}.svg`" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Delete</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable>
                <q-item-section avatar>
                  <q-avatar :icon="`img:icons/svg/settings${$q.dark.mode ? '_lighten' : ''}.svg`" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Settings</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
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
          <q-btn v-close-popup class="border-primary-highlight" label="Cancel" rounded text-color="dark-mode-text" />
          <q-btn v-close-popup color="primary" label="Confirm" rounded @click="deleteChat(deleteChatId!)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-list>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useChatsStore } from 'stores/chats';
import { useRoute, useRouter } from 'vue-router';
import { nextTick, ref } from 'vue';

const chatsStore = useChatsStore();
const route = useRoute();
const router = useRouter();

const { chats } = storeToRefs(chatsStore);
const deleteChatConfirmAction = ref(false);
const deleteChatId = ref<string | null>(null);

// Delete a chat
async function deleteChat(chatId: string) {
  await chatsStore.deleteChat(chatId);
  if (route.params?.id === chatId) {
    await nextTick(() => router.push('/new'));
  }
}

async function deleteChatConfirm(chatId: string) {
  deleteChatConfirmAction.value = true;
  deleteChatId.value = chatId;
}
</script>

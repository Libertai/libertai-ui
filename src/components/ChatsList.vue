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
          <ltai-icon
            :dark-color="route.params?.id === chat.id ? 'primary' : undefined"
            :light-color="route.params?.id === chat.id ? 'primary' : 'grey'"
            class="tw-p-1"
            name="svguse:icons.svg#message"
            size="xs"
          />
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
              <q-item v-close-popup clickable @click="openChatSettings(chat)">
                <q-item-section avatar>
                  <ltai-icon class="tw-mx-auto" name="svguse:icons.svg#settings" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Settings</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup clickable @click="deleteChatConfirm(chat.id)">
                <q-item-section avatar>
                  <ltai-icon class="tw-mx-auto" name="svguse:icons.svg#delete" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Delete</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </q-item>
    </q-scroll-area>
    <ltai-dialog v-model="deleteChatConfirmAction" title="Delete chat" @save="deleteChat(deleteChatId!)">
      <q-card-section class="row">
        <span>Are you sure you want to delete the current chat conversation?</span>
      </q-card-section>
    </ltai-dialog>
    <chat-settings-dialog v-model="showChatSettings" :chat="settingsChat" @save-chat="saveChatSettings" />
  </q-list>
</template>

<script lang="ts" setup>
import ChatSettingsDialog from 'components/dialog/ChatSettingsDialog.vue';
import LtaiDialog from 'components/libertai/LtaiDialog.vue';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import { storeToRefs } from 'pinia';
import { Chat } from 'src/types/chats';
import { useChatsStore } from 'stores/chats';
import { nextTick, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const chatsStore = useChatsStore();
const route = useRoute();
const router = useRouter();

const { getSortedChats: chats } = storeToRefs(chatsStore);

const deleteChatConfirmAction = ref(false);
const deleteChatId = ref<string | null>(null);
const showChatSettings = ref(false);
const settingsChat = ref<Chat | null>(null);

// Delete a chat
async function deleteChat(chatId: string) {
  chatsStore.deleteChat(chatId);
  if (route.params?.id === chatId) {
    await nextTick(() => router.push('/new'));
  }
}

function openChatSettings(chatToEdit: Chat) {
  settingsChat.value = chatToEdit;
  showChatSettings.value = true;
}

function saveChatSettings(newChat: Chat) {
  chatsStore.updateChat(newChat.id, {
    username: newChat.username,
    modelId: newChat.modelId,
    persona: JSON.parse(JSON.stringify(newChat.persona)),
    knowledgeBases: JSON.parse(JSON.stringify(newChat.knowledgeBases)),
  });
  router.go(0);
}

function deleteChatConfirm(chatId: string) {
  deleteChatConfirmAction.value = true;
  deleteChatId.value = chatId;
}
</script>

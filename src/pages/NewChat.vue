<template>
  <q-page class="align-items-center tw-flex tw-flex-col">
    <div class="q-pb-xl">
      <div class="row tw-justify-center max-sm:tw-m-4 sm:tw-m-12">
        <q-card class="my-card center text-center q-pa-md" flat>
          <q-avatar>
            <img :src="getPersonaAvatarUrl(personasStore.persona.avatar.ipfs_hash)" alt="avatar" />
          </q-avatar>

          <q-card-section>
            <div class="rounded-borders bg-secondary q-pa-md text-center text-light">
              Hi I'm your LibertAI assistant.<br />How can I assist you today?
            </div>
          </q-card-section>
          <q-card-section>
            <persona-drop-down />
          </q-card-section>
        </q-card>
      </div>
      <div class="fixed-bottom absolute q-mb-xl q-pb-xs">
        <message-input
          ref="input"
          v-model="messageInputRef"
          hint="Disclaimer: This chat bot uses personas for entertainment and informational purposes only. The
              chat bot's responses are not a reflection of any real person or organization's views or opinions, and should not
              be used as a substitute for professional advice. The accuracy and reliability of the chat bot's responses cannot
              be guaranteed. Users should exercise their own judgment and discretion when interacting with the chat bot and
              its personas. By using this chat bot, you acknowledge and agree to these terms."
          @send-message="sendMessage"
        />
      </div>
      <q-space />
    </div>
  </q-page>
</template>
<script lang="ts" setup>
import { defaultChatTopic } from 'src/utils/chat';

// Import State
import { useModelsStore } from 'stores/models';
import { useChatsStore } from 'stores/chats';
import { usePersonasStore } from 'stores/personas';
import { useSettingsStore } from 'stores/settings';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Import components
import MessageInput from 'src/components/MessageInput.vue';
import PersonaDropDown from 'src/components/PersonaDropDown.vue';
import { getPersonaAvatarUrl } from 'src/utils/personas';

const router = useRouter();

// Stored State

const modelsStore = useModelsStore();
const chatsStore = useChatsStore();
const personasStore = usePersonasStore();

const username = useSettingsStore().username;

// Message input state
const messageInputRef = ref('');

async function sendMessage() {
  const message = messageInputRef.value;
  if (message.length === 0) {
    return;
  }

  // Extract the values out of our relevant refs
  const title = defaultChatTopic;
  // NOTE: this is a ref to the store, so we need to deep clone it
  const persona = JSON.parse(JSON.stringify(personasStore.persona));

  // Creates the new chat
  const chat = await chatsStore.createChat(title, username, modelsStore.selectedModel.id, persona);
  // Append the first user message to the chat history
  await chatsStore.appendUserMessage(chat.id, message);

  // Set the message to empty
  messageInputRef.value = '';
  // Navigate to the chat page
  await router.push({ name: 'chat', params: { id: chat.id } });
}
</script>

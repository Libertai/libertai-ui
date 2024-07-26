<template>
  <q-page class="align-items-center tw-flex tw-flex-col">
    <div class="q-pb-xl">
      <div class="row tw-justify-center max-sm:tw-m-4 sm:tw-m-12">
        <q-card class="my-card center text-center q-pa-md" flat>
          <q-avatar>
            <img :src="getPersonaAvatarUrl(selectedPersona.avatar.ipfs_hash)" alt="avatar" />
          </q-avatar>

          <q-card-section>
            <div class="rounded-borders bg-secondary q-pa-md text-center text-light">
              Hi I'm your LibertAI assistant.<br />How can I assist you today?
            </div>
          </q-card-section>
          <q-card-section>
            <div class="tw-gap-2 tw-flex tw-flex-col tw-text-center">
              <p>Persona</p>
              <persona-dropdown
                :selected-persona="selectedPersona"
                @select-persona="(persona: UIPersona) => (selectedPersona = persona)"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <div class="tw-gap-2 tw-flex tw-flex-col tw-text-center">
              <p>Model</p>
              <model-selector
                :selected-model="selectedModel"
                @select-model="(model: UIModel) => (selectedModel = model)"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <span>Your name</span>
            <q-input v-model="username" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
          </q-card-section>
        </q-card>
      </div>
      <div class="fixed-bottom absolute q-mb-xl tw-pb-1">
        <message-input
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
import { defaultChatTopic } from 'src/utils/chat'; // Import State
import { useModelsStore } from 'stores/models';
import { useChatsStore } from 'stores/chats';
import { usePersonasStore } from 'stores/personas';
import { useSettingsStore } from 'stores/settings';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import components
import MessageInput from 'src/components/MessageInput.vue';
import PersonaDropdown from 'components/select/PersonaSelector.vue';
import { getPersonaAvatarUrl } from 'src/utils/personas';
import ModelSelector from 'components/select/ModelSelector.vue';
import { UIModel } from 'src/utils/models';
import { UIPersona } from 'src/types/personas';
import { SendMessageParams } from 'src/types/chats';

const router = useRouter();

// Stored State
const modelsStore = useModelsStore();
const chatsStore = useChatsStore();
const personasStore = usePersonasStore();
const settingsStore = useSettingsStore();

const route = useRoute();

// Inputs
const selectedModel = ref<UIModel>(modelsStore.models[0]);
const selectedPersona = ref<UIPersona>(personasStore.personas[0]);
const username = ref(settingsStore.username);

watch(
  () => route.query.persona as string | undefined,
  (personaId: string | undefined) => {
    if (personaId) {
      const persona = personasStore.personas.find((p) => p.id === personaId);
      if (persona) {
        selectedPersona.value = persona;
      }
    }
  },
  {
    immediate: true,
  },
);

async function sendMessage({ content, attachments }: SendMessageParams) {
  // Extract the values out of our relevant refs
  const title = defaultChatTopic;
  // NOTE: this is a ref to the store, so we need to deep clone it
  const persona = JSON.parse(JSON.stringify(selectedPersona.value));

  // Creates the new chat
  const chat = await chatsStore.createChat(title, username.value, selectedModel.value.id, persona);
  // Append the first user message to the chat history
  await chatsStore.appendUserMessage(chat.id, content, attachments);

  // Navigate to the chat page
  await router.push({ name: 'chat', params: { id: chat.id } });
}
</script>

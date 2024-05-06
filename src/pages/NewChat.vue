<template>
  <q-page class="align-items-center" style="display: flex; flex-direction: column">
    <!-- Persona Selection -->
    <q-tabs
      v-model="selectedPersonaIdRef"
      narrow-indicator
      dense
      align="justify"
      active-color="white"
      no-caps
      mobile-arrows
      class="q-pa-lg"
    >
      <q-tab v-for="persona of personasStore.personas" :key="persona.id" :name="persona.id">
        <q-avatar size="64px" color="white" class="q-mb-xs">
          <img :src="persona.avatarUrl" class="q-pa-xs" />
        </q-avatar>
        {{ persona.name }}
      </q-tab>
    </q-tabs>

    <q-expansion-item
      v-model="advancedShownRef"
      :icon="'img:' + selectedPersonaRef.avatarUrl"
      label="Customize"
      style="flex-grow: 1"
      class="q-pa-lg"
    >
      <q-card>
        <q-card-section class="row q-col-gutter-sm">
          <q-input v-model="usernameInputRef" placeholder="user" label="Your name" standout class="col-6" />
          <q-input v-model="selectedPersonaRef.name" label="Persona name" standout class="col-6" />
        </q-card-section>
        <q-card-section class="">
          <q-input
            autogrow
            v-model="selectedPersonaRef.description"
            type="textarea"
            label="Persona Description"
            standout
          />
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <div class="q-pb-xl">
      <message-input
        @sendMessage="sendMessage"
        v-model="messageInputRef"
        ref="input"
        hint="Disclaimer: This chat bot uses personas for entertainment and informational purposes only. The
                chat bot's responses are not a reflection of any real person or organization's views or opinions, and should not
                be used as a substitute for professional advice. The accuracy and reliability of the chat bot's responses cannot
                be guaranteed. Users should exercise their own judgment and discretion when interacting with the chat bot and
                its personas. By using this chat bot, you acknowledge and agree to these terms."
      />
    </div>
  </q-page>
</template>
<script>
import { defaultChatTopic } from 'src/utils/chat';

// Import State
import { useModelsStore } from 'src/stores/models-store';
import { useChatsStore } from 'src/stores/chats-store';
import { usePersonasStore } from 'src/stores/personas-store';
import { defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Import components
import MessageInput from 'src/components/MessageInput.vue';

export default defineComponent({
  name: 'NewChat',
  components: {
    MessageInput,
  },
  setup() {
    const router = useRouter();

    // Stored State

    const modelsStore = useModelsStore();
    const chatsStore = useChatsStore();
    // TODO: We probably don't need to use a store for this
    const personasStore = usePersonasStore();

    // Our local page state

    // Control whether the advanced persona customization is shown
    const advancedShownRef = ref(false);
    // Persona selection state -- set to the first persona by default
    // NOTE: this is kinda janky but we'll keep this around to reset the personas
    //  once a user initiates a new chat. This is probably an indication that available personas
    //   should not be a part of global state.
    const personasClone = JSON.parse(JSON.stringify(personasStore.personas));
    const selectedPersonaRef = ref(personasStore.personas[0]);
    const selectedPersonaIdRef = ref(personasStore.personas[0].id);
    // Username input state
    const usernameInputRef = ref('user');
    // Message input state
    const messageInputRef = ref('');

    // now watch for that id change
    watch(
      () => selectedPersonaIdRef.value,
      (newId) => {
        setPersona(newId);
      },
    );

    async function sendMessage() {
      let message = messageInputRef.value;
      if (message.length === 0) {
        console.warn('page::NewChat::sendMessage: message is empty');
        return;
      }

      // Extract the values out of our relevant refs
      let title = defaultChatTopic;
      let username = usernameInputRef.value;
      // NOTE: these are refs to the store, so we need to deep clone them
      let model = JSON.parse(JSON.stringify(modelsStore.selectedModel));
      let persona = JSON.parse(JSON.stringify(selectedPersonaRef.value));

      // Reset the personas now that we have a deep clone of the selected persona
      personasStore.personas = personasClone;

      // Creates the new chat
      let chat = await chatsStore.createChat(title, username, model, persona);
      // Append the first user message to the chat history
      await chatsStore.appendUserMessage(chat.id, message);

      // Set the message to empty
      messageInputRef.value = '';
      // Navigate to the chat page
      router.push({ name: 'chat', params: { id: chat.id } });
    }

    function setPersona(id) {
      selectedPersonaRef.value = personasStore.personas.find((persona) => persona.id === id);
    }

    return {
      advancedShownRef,
      selectedPersonaRef,
      selectedPersonaIdRef,
      usernameInputRef,
      messageInputRef,
      sendMessage,
      setPersona,
      modelsStore,
      personasStore,
      localSettings: {
        temperature: 0.72,
        maxLength: 100,
      },
    };
  },
});
</script>
<style scoped>
/* scale in animation */
.scale-in-enter,
.scale-in-leave-to {
  transform: scale(0.88);
  opacity: 0;
}

.scale-in-enter-active,
.scale-in-leave-active {
  transition:
    transform 0.3s,
    opacity 0.5s;
}
</style>

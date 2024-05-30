<template>
  <q-page class="align-items-center" style="display: flex; flex-direction: column">
    <div class="q-pb-xl">
      <div :class="$q.screen.gt.sm ? 'row q-ma-xl' : 'row qm-ma-md'">
        <div class="col"></div>
        <div :class="$q.screen.gt.sm ? 'col-4' : 'col-10'">
          <q-card class="my-card center text-center q-my-xl" flat>
            <q-avatar>
              <img :src="personasStore.persona.avatarUrl" />
            </q-avatar>

            <q-card-section>
              <div class="rounded-borders bg-secondary q-pa-md text-left text-light">
                Hi I'm your Libertai Assistant.<br />How can I assist you today?
              </div>
            </q-card-section>
            <q-card-section>
              <persona-drop-down />
            </q-card-section>
          </q-card>
        </div>
        <div class="col"></div>
      </div>
      <div class="fixed-bottom absolute q-mb-xl q-pb-xs">
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
      <q-space />
    </div>
  </q-page>
</template>
<script>
import { defaultChatTopic } from 'src/utils/chat';

// Import State
import { useModelsStore } from 'src/stores/models-store';
import { useChatsStore } from 'src/stores/chats-store';
import { usePersonasStore } from 'src/stores/personas-store';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

// Import components
import MessageInput from 'src/components/MessageInput.vue';
import PersonaDropDown from 'src/components/PersonaDropDown.vue';

export default defineComponent({
  name: 'NewChat',
  components: {
    MessageInput,
    PersonaDropDown,
  },
  setup() {
    const router = useRouter();

    // Stored State

    const modelsStore = useModelsStore();
    const chatsStore = useChatsStore();
    // TODO: We probably don't need to use a store for this
    const personasStore = usePersonasStore();

    // Our local page state

    const usernameInputRef = ref('user');
    // Message input state
    const messageInputRef = ref('');

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
      let persona = JSON.parse(JSON.stringify(personasStore.persona));

      // Reset the personas now that we have a deep clone of the selected persona
      //personasStore.personas = personasClone;
      // Creates the new chat
      let chat = await chatsStore.createChat(title, username, model, persona);
      // Append the first user message to the chat history
      await chatsStore.appendUserMessage(chat.id, message);

      // Set the message to empty
      messageInputRef.value = '';
      // Navigate to the chat page
      router.push({ name: 'chat', params: { id: chat.id } });
    }

    return {
      usernameInputRef,
      messageInputRef,
      sendMessage,
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

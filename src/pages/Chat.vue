<template>
  <q-page class="column align-items-center">
    <div
      class="col-grow overflow-auto"
      style="max-height: calc(100vh - 190px)"
      ref="scrollAreaRef"
    >
      <q-list class="col-grow">
        <q-item
          v-for="(message, message_index) in messagesRef"
          :key="message.id"
          :class="`q-py-lg items-start dyn-container chat-item ${
            message.role == usernameRef ? 'bg-dark' : ''
          }`"
        >
          <q-item-section avatar>
            <q-avatar v-if="message.role == usernameRef">
              <img src="avatars/00057-2093295138.png" />
            </q-avatar>
            <q-avatar v-else>
              <img :src="chatRef.persona.avatarUrl" />
            </q-avatar>
          </q-item-section>
          <q-item-section :style="`max-width: calc(960px - 56px);`">
            <q-popup-edit
              v-model="message.content"
              auto-save
              v-slot="scope"
              v-if="enableEditRef"
            >
              <strong>{{ message.role }}</strong>
              <q-input v-model="scope.value" dense autofocus counter autogrow />
            </q-popup-edit>
            <q-item-label class="text-semibold">
              {{
                message.role
                  .replace("user", "You")
                  .replace("assistant", "Libertai")
              }}
            </q-item-label>
            <q-item-label style="display: block">
              <MarkdownRenderer :content="message.content" breaks />
              <q-spinner-bars
                color="white"
                size="2em"
                v-if="!message.stopped && isLoadingRef"
              />
              <span class="text-warning" v-if="!!message.error">
                <q-tooltip>Error: {{ message.error.message }}</q-tooltip>
                <q-icon name="warning" /> There has been an error, please
                <a @click="regenerateMessage()">retry</a>.
              </span>
            </q-item-label>
          </q-item-section>
          <div class="absolute dyn-container chat-toolbar">
            <q-btn
              @click="regenerateMessage()"
              icon="refresh"
              dense
              flat
              size="sm"
              v-if="!isLoadingRef && message_index == messagesRef.length - 1"
            >
              <q-tooltip>Regenerate</q-tooltip>
            </q-btn>
            <q-btn
              @click="copyMessage(message)"
              icon="content_copy"
              dense
              flat
              size="sm"
            >
              <q-tooltip>Copy</q-tooltip>
            </q-btn>
          </div>
        </q-item>
      </q-list>
    </div>

    <message-input
      :isLoading="isLoadingRef"
      @sendMessage="sendMessage"
      v-model="inputTextRef"
      ref="inputRef"
    />
    <q-checkbox
      v-model="enableEditRef"
      left-label
      class="q-mr-lg q-mb-md fixed-bottom-right"
    >
      <q-tooltip anchor="top right" class="bg-primary" self="bottom right"
        >When this is activated, just click on a message to start editing
        it.</q-tooltip
      >
      Enable edits
    </q-checkbox>
  </q-page>
</template>

<script>
import "highlight.js/styles/devibeans.css";
import { useQuasar, copyToClipboard } from "quasar";
import { defineComponent, ref, watch, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

// LlamaCppApiEngine
import { LlamaCppApiEngine } from "libertai-js";

// Local state
import { useChatsStore } from "../stores/chats-store";
import { useModelsStore } from "../stores/models-store";

// Components
import MarkdownRenderer from "../components/MarkdownRenderer.vue";
import MessageInput from "../components/MessageInput.vue";
import axios from "axios";

console.log(nextTick);

export default defineComponent({
  name: "ChatPage",
  components: {
    MarkdownRenderer,
    MessageInput,
  },
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();

    // App state
    const chatsStore = useChatsStore();
    const modelsStore = useModelsStore();

    // Local page state
    const inputTextRef = ref("");
    const isLoadingRef = ref(false);
    const hasResetRef = ref(false);
    const inputRef = ref(null);
    const scrollAreaRef = ref(null);
    const enableEditRef = ref(false);

    // Chat specific state
    const chatRef = ref();
    const personaRef = ref();
    const usernameRef = ref();
    const messagesRef = ref([]);

    // Instance of an inference engine
    const inferenceEngine = new LlamaCppApiEngine();

    // Clear the chat as soon as we mount
    onMounted(() => {
      nextTick(clearCookies);
    });

    /* Set chat on initial load */

    setChat(route.params.id);

    /* Watchers */

    // Update the chat when the route changes
    watch(
      () => route.params.id,
      async (newId) => {
        await setChat(newId);
      },
    );

    // Update the chat model when the selected model changes
    watch(
      () => modelsStore.selectedModel,
      async (newModel) => {
        // Ser / DeSer to ensure we have a fresh copy
        newModel = JSON.parse(JSON.stringify(newModel));

        let chatModelApiUrl = chatRef.value.model.apiUrl;
        if (chatModelApiUrl !== newModel.apiUrl) {
          // We have a new model, so update local and stored state
          chatRef.value.model = newModel;
          await chatsStore.updateChatModel(chatRef.value.id, newModel);

          // Send a notification
          $q.notify(`Changing current chat model to ${newModel.name}`);
        }
      },
    );

    /* Helper functions */

    // Set the name of the chat based on the first sentence
    async function setChatName(first_sentence) {
      // Get our chat id
      let chatId = chatRef.value.id;
      console.log(
        "pages::Chat.vue::setChatName - id = %s |  first_sentence = %s",
        chatId,
        first_sentence,
      );

      // Infer what the title should be
      let model = JSON.parse(JSON.stringify(chatRef.value.model));
      const title = await inferenceEngine.summarizeSnippet(
        first_sentence,
        model,
      );

      console.log("pages::Chat.vue::setChatName - title", title);

      if (!title || title === "") {
        return;
      }

      // Update the chat title state
      await chatsStore.updateChatTitle(chatId, title);
      chatRef.value.title = title;
    }

    // Scroll to the bottom of the chat when new messages are added
    async function scrollBottom() {
      scrollAreaRef.value.lastElementChild.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    // Generate a new response from the AI
    async function generatePersonaMessage() {
      console.log(
        "pages::Chat.vue::generatePersonaMessage: messages",
        messagesRef,
      );

      let chatId = chatRef.value.id;
      let messages = messagesRef.value;
      let persona = personaRef.value;
      let model = chatRef.value.model;

      // Create a new message to encapsulate our response
      let response = {
        role: persona.name,
        content: "",
        stopped: false,
        error: null,
      };
      // And push it to the local state
      messagesRef.value = [...messagesRef.value, response];
      chatRef.value.messages = messagesRef.value;

      try {
        // Set loading state
        isLoadingRef.value = true;
        hasResetRef.value = false;

        // Generate a stream of responses from the AI
        for await (const output of inferenceEngine.generateAnswer(
          messages,
          model,
          persona,
        )) {
          console.log(
            "pages::Chat.vue::generatePersonaMessage - output",
            output,
          );
          response.content = output.content;
          response.stopped = output.stopped;
          messagesRef.value = [...messagesRef.value];
        }

        // Append the chat to long term storage if successful
        await chatsStore.appendModelResponse(chatId, response.content);
      } catch (error) {
        console.error("pages::Chat.vue::generatePersonaMessage - error", error);
        response.error = error;
      } finally {
        // Done! update the local state
        isLoadingRef.value = false;
        messagesRef.value = [...messagesRef.value];
      }
    }

    // Regenerate the last message from the AI
    async function regenerateMessage() {
      console.log("pages::Chat.vue::regenerateMessage");
      // we discard the last message if it's from the AI, and regenerate
      const lastMessage = messagesRef.value[messagesRef.value.length - 1];
      if (lastMessage.role !== usernameRef.value) {
        let chatId = chatRef.value.id;
        // Update the local state
        messagesRef.value.pop();
        messagesRef.value = [...messagesRef.value];
        chatRef.value.messages = messagesRef.value;
        // Update the chat state
        await chatsStore.popChatMessages(chatId);
      }
      await generatePersonaMessage();
    }

    async function sendMessage(content) {
      console.log("pages::Chat.vue::sendMessage");
      let chatId = chatRef.value.id;
      let inputText = inputTextRef.value;

      // Wipe the input text
      inputTextRef.value = "";

      nextTick(scrollBottom);

      if (!content.trim()) return;

      if (content.trim() === "") return;

      // Append the new message to the chat history and push to local state
      let newMessage = await chatsStore.appendUserMessage(chatId, inputText);
      messagesRef.value.push({ ...newMessage, stopped: true, error: null });
      chatRef.value.messages = messagesRef.value;
      await generatePersonaMessage();
    }

    // Set a chat by its ID
    async function setChat(chatId) {
      console.log("pages::Chat.vue::setChat - chatId", chatId);
      // Load the chat from the store and set it
      chatRef.value = await chatsStore.loadChat(chatId);
      if (!chatRef.value) {
        console.error("pages::Chat.vue::setChat - chat not found");
        await router.push({ name: "new-chat" });
        return;
      }

      let title = chatRef.value.title;
      let username = chatRef.value.username;
      // Load messages, mapping over with additional properties
      let messages = chatRef.value.messages.map((message) => {
        // Set stopped to true
        message.stopped = true;
        // Set error to null
        message.error = null;
        return message;
      });
      let persona = chatRef.value.persona;

      // Set the selected model for the chat by its URL
      let modelApiUrl = chatRef.value.model.apiUrl;
      modelsStore.setModelByURL(modelApiUrl);

      // Set the local messages state
      messagesRef.value = messages;

      // Set the persona
      personaRef.value = persona;

      // Set the username
      usernameRef.value = username;

      // Set the chat title if it's not set (New Chat should be the default title)
      if (title === "New Chat" || title === "") {
        setChatName(messages[0].content);
      }

      // If this is true, then this is a new chat we need to respond to
      if (messages.length == 1) {
        await generatePersonaMessage();
      }
      nextTick(scrollBottom);
    }

    async function copyMessage(message) {
      await copyToClipboard(message.content);
      $q.notify("Message copied to clipboard");
    }

    async function clearCookies() {
      // Clear the slots
      inferenceEngine.clearSlots();
      // Clear the cookies from aleph
      await axios.get("https://curated.aleph.cloud/change-pool", {
        withCredentials: true,
      });
      // Set the reset flag
      hasResetRef.value = true;
    }

    return {
      scrollAreaRef,
      chatRef,
      messagesRef,
      usernameRef,
      personaRef,
      isLoadingRef,
      inputRef,
      inputTextRef,
      sendMessage,
      enableEditRef,
      regenerateMessage,
      copyMessage,
      chatId: route.params.id,
    };
  },
});
</script>
<style>
code.hljs {
  border-radius: 8px;
  font-size: 0.9em;
}

.col-grow * {
  min-width: 0;
}

pre,
code {
  overflow-x: auto;
  font-size: 90%;
  max-width: calc(100vw - 40px - 40px - 16px);
  min-width: 0;
}

.chat-item {
  .chat-toolbar {
    right: 0px;
    bottom: 10px;
  }

  a {
    color: inherit;
  }
}

/* on desktop, we want to show the toolbar only on hover */
@media (min-width: 600px) {
  .chat-item {
    .chat-toolbar {
      right: 0px;
      top: 10px;
      bottom: auto;
      opacity: 0;
      transition: opacity 0.1s;
    }

    &:hover {
      .chat-toolbar {
        opacity: 1;
      }
    }
  }
}
</style>

<template>
  <q-page class="column align-items-center">
    <div class="col-grow overflow-auto" style="max-height: calc(100vh - 190px)" ref="scrollAreaRef">
      <!-- Show loading spinner when loading -->
      <q-spinner-gears v-if="isLoadingRef" />

      <!-- Display message history -->

      <q-list class="col-grow" v-if="chatRef">
        <!-- Determine styling based on the role of the message (if it's the user or the AI) -->
        <q-item
          v-for="message in messagesRef"
          :key="message.id"
          :class="`q-py-lg items-start dyn-container chat-item ${message.role == usernameRef ? 'bg-dark' : ''}`"
        >
          <!-- Display the avatar of the user or the AI -->
          <q-item-section avatar>
            <q-avatar v-if="message.role == usernameRef">
              <img src="avatars/00057-2093295138.png" />
            </q-avatar>
            <q-avatar v-else>
              <img :src="chatRef.persona.avatarUrl" />
            </q-avatar>
          </q-item-section>
          <q-item-section :style="`max-width: calc(960px - 56px);`">
            <!-- Display the role of the user or the AI -->
            <q-item-label class="text-semibold">
              {{ message.role.replace(chatRef.username, 'You').replace('assistant', 'Libertai') }}
            </q-item-label>
            <!-- Display any attachments -->
            <q-item-label v-if="message.attachments && message.attachments.length > 0">
              <q-chip
                v-for="attachment in message.attachments"
                :key="attachment.id"
                class="q-mr-xs bg-primary text-white"
              >
                {{ attachment.title }}
              </q-chip>
            </q-item-label>
            <!-- Display the content of the message -->
            <q-item-label style="display: block">
              <MarkdownRenderer :content="message.content" breaks />
            </q-item-label>
          </q-item-section>
          <!-- Chat item toolbar -->
          <div class="absolute dyn-container chat-toolbar">
            <!-- Allow copying the message to the clipboard -->
            <q-btn @click="copyMessage(message)" icon="content_copy" dense flat size="sm">
              <q-tooltip>Copy</q-tooltip>
            </q-btn>
          </div>
        </q-item>
      </q-list>
    </div>
    <!-- If we have a chat, display the option to imprt it -->
    <q-btn v-if="chatRef" @click="importChat" label="Import chat" class="q-mt-md" />
  </q-page>
</template>

<script>
import 'highlight.js/styles/devibeans.css';
import { useQuasar, copyToClipboard } from 'quasar';
import { defineComponent, ref, watch, nextTick, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getJsonFromAleph } from 'src/utils/share';

// Local state
import { useChatsStore } from 'src/stores/chats-store';

// Components
import MarkdownRenderer from 'src/components/MarkdownRenderer.vue';

console.log(nextTick);

export default defineComponent({
  name: 'SharedChatPage',
  components: {
    MarkdownRenderer,
  },
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();

    // App state
    const chatsStore = useChatsStore();

    // Local page state
    const isLoadingRef = ref(false);
    const scrollAreaRef = ref(null);

    // Chat specific state
    const chatRef = ref();
    const personaRef = ref();
    const usernameRef = ref();
    const messagesRef = ref([]);

    // Clear the chat as soon as we mount
    onMounted(() => {});

    /* Set chat on initial load */

    pullChat(route.params.item_hash);

    /* Watchers */

    // Update the chat when the route changes
    watch(
      () => route.params.item_hash,
      async (newItemHash) => {
        await pullChat(newItemHash);
      },
    );

    /* Helper functions */

    // Scroll to the bottom of the chat when new messages are added
    async function scrollBottom() {
      scrollAreaRef.value.lastElementChild.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }

    // Set a chat by its ID
    async function pullChat(chatItemHash) {
      try {
        // Set loading state
        isLoadingRef.value = true;
        // Pull the json from aleph
        const chatJson = await getJsonFromAleph(chatItemHash);

        chatRef.value = chatJson;
        if (!chatRef.value) {
          console.error('pages::Chat.vue::setChat - chat not found');
          await router.push({ name: 'new-chat' });
          return;
        }

        // Extract the chat properties
        let username = chatRef.value.username;
        // Load messages, mapping over with additional properties we need in the UI
        let messages = chatRef.value.messages;

        let persona = chatRef.value.persona;

        // Set the local messages state
        messagesRef.value = messages;

        // Set the local persona state
        personaRef.value = persona;

        // Set the local username state
        usernameRef.value = username;

        nextTick(scrollBottom);
      } catch (error) {
        console.error('pages::Chat.vue::setChat - error', error);
        $q.notify('Error loading chat');
      } finally {
        // Set loading state

        isLoadingRef.value = false;
      }
    }

    // import char
    async function importChat() {
      try {
        isLoadingRef.value = true;
        const chatJson = JSON.parse(JSON.stringify(chatRef.value));
        await chatsStore.importChat(chatJson);
        $q.notify('Chat imported');
      } catch (error) {
        console.error('pages::Chat.vue::importChat - error', error);
        $q.notify('Error importing chat');
      } finally {
        isLoadingRef.value = false;
      }
    }

    async function copyMessage(message) {
      await copyToClipboard(message.content);
      $q.notify('Message copied to clipboard');
    }

    return {
      scrollAreaRef,
      chatRef,
      messagesRef,
      usernameRef,
      personaRef,
      isLoadingRef,
      copyMessage,
      importChat,
      chatItemHash: route.params.item_hash,
    };
  },
});
</script>
<style>
/* Ensure message input expands to fill available space */
.message-input {
  width: 100%; /* Adjust as needed to ensure proper sizing */
}

/* Adjust the size of the message bar */
.row.items-center.q-mb-md.q-mr-md {
  width: calc(100% - 32px);
}

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

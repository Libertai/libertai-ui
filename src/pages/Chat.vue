<template>
  <q-page v-if="chatRef" class="column align-items-center">
    <div ref="scrollAreaRef" class="col-grow overflow-auto" style="max-height: calc(100vh - 190px)">
      <!-- Display message history -->
      <q-list class="col-grow q-ma-xl">
        <!-- eslint-disable-next-line vue/valid-v-for -->
        <q-item
          v-for="(message, message_index) in chatRef.messages"
          :class="`q-py-md q-my-md max-sm:tw-mx-2 sm:tw-mx-12 items-start dyn-container chat-item rounded-borders ${$q.dark.mode ? '' : message.author === 'user' ? 'bg-white' : 'bg-secondary'}`"
        >
          <!-- Display the avatar of the user or the AI -->
          <q-item-section avatar>
            <q-avatar v-if="message.author === 'user'">
              <img :src="getPersonaAvatarUrl(settingsStore.avatar.ipfs_hash)" alt="user" />
            </q-avatar>
            <q-avatar v-else>
              <img :src="getPersonaAvatarUrl(chatRef.persona.avatar.ipfs_hash)" alt="AI" />
            </q-avatar>
          </q-item-section>
          <!-- Edit message popup -- triggered on click if the edit mode is enabled -->
          <q-item-section :ref="'message-' + message_index" :style="`max-width: calc(960px - 56px);`">
            <q-popup-edit
              v-if="enableEditRef"
              v-slot="scope"
              v-model="message.content"
              auto-save
              @save="
                (value: string, initialValue: string) => updateChatMessageContent(message_index, value, initialValue)
              "
            >
              <strong>{{ message.role }}</strong>
              <q-input v-model="scope.value" autofocus autogrow counter dense />
            </q-popup-edit>
            <!-- Display the name of the user or the AI -->
            <q-item-label class="text-semibold q-mb-md">
              <span v-if="message.author === 'user'">{{ chatRef.username }}</span>
              <span v-else>{{ chatRef.persona.name }}</span>

              <span class="bull-date">{{ formatDate(message.timestamp) }}</span>
            </q-item-label>
            <!-- Display any attachments -->
            <q-item-label v-if="message.attachments && message.attachments.length > 0">
              <q-chip
                v-for="attachment in message.attachments"
                :key="attachment.id"
                class="tw-mr-1 bg-primary text-white"
                icon="img:icons/svg/attachment.svg"
              >
                {{ attachment.title }}
              </q-chip>
            </q-item-label>
            <!-- Display the content of the message -->
            <q-item-label class="tw-block">
              <MarkdownRenderer
                :class="message.author === 'user' ? '' : 'message-content'"
                :content="message.content"
                breaks
              />
              <!-- Display the loading spinner if the message is still loading -->
              <q-spinner-bars v-if="!message.stopped && isLoadingRef" color="white" size="2em" />
              <!-- Display the error message if the message errored  on generate -->
              <span v-if="!!message.error" class="text-warning">
                <q-tooltip>Error: {{ message.error.message }}</q-tooltip>
                <q-icon name="warning" />There has been an error, please <a @click="regenerateMessage()">retry</a>.
              </span>
            </q-item-label>
          </q-item-section>
          <!-- Chat item toolbar -->
          <div class="absolute dyn-container chat-toolbar">
            <!-- Allow regenerating the last message from the AI if fully completed -->
            <q-btn
              v-if="!isLoadingRef && message.author === 'ai'"
              dense
              flat
              icon="refresh"
              size="sm"
              @click="regenerateMessage()"
            >
              <q-tooltip>Regenerate</q-tooltip>
            </q-btn>
            <!-- Allow copying the message to the clipboard -->
            <q-btn
              :icon="`img:icons/svg/copy2${$q.dark.mode ? '_lighten' : ''}.svg`"
              dense
              flat
              size="sm"
              @click="copyMessage(message)"
            >
              <q-tooltip>Copy</q-tooltip>
            </q-btn>
            <q-btn
              :icon="`img:icons/svg/edit${$q.dark.mode ? '_lighten' : ''}.svg`"
              dense
              flat
              size="sm"
              @click="editMessage(($refs['message-' + message_index] as any)[0])"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
          </div>
        </q-item>
      </q-list>
    </div>

    <div class="q-mb-md q-mr-md">
      <message-input :is-loading="isLoadingRef" class="col" @send-message="sendMessage" />
    </div>

    <!-- This should really not pass the ref, but it's a quick fix for now -->
    <!--    <q-dialog v-model="showKnowledgeUploaderRef" position="bottom">-->
    <!--      <KnowledgeStoreUploader-->
    <!--        :chat-ref="chatRef"-->
    <!--        auto-upload-->
    <!--        label="Auto KnowledgeStoreUploader"-->
    <!--        multiple-->
    <!--        url="http://localhost:4444/upload"-->
    <!--        @attachment-added="addAttachment"-->
    <!--      />-->
    <!--    </q-dialog>-->
  </q-page>
</template>

<script lang="ts" setup>
import 'highlight.js/styles/devibeans.css';
import { copyToClipboard, date, DateUnitOptions, useQuasar } from 'quasar';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { defaultChatTopic, inferChatTopic } from 'src/utils/chat';

import { LlamaCppApiEngine, Message } from '@libertai/libertai-js';

import { useChatsStore } from 'stores/chats';
import { useModelsStore } from 'stores/models';

import MarkdownRenderer from 'src/components/MarkdownRenderer.vue';
import MessageInput from 'src/components/MessageInput.vue';
import axios from 'axios';
import { getPersonaAvatarUrl } from 'src/utils/personas';
import { useSettingsStore } from 'stores/settings';
import { Chat, SendMessageParams, UIMessage } from 'src/types/chats';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

// App state
const chatsStore = useChatsStore();
const modelsStore = useModelsStore();
// const knowledgeStore = useKnowledgeStore();
const settingsStore = useSettingsStore();

// Local page state
const isLoadingRef = ref(false);
const scrollAreaRef = ref<HTMLDivElement>();
const enableEditRef = ref(false);
// const showKnowledgeUploaderRef = ref(false);

const chatRef = ref<Chat>();

// Instance of an inference engine
const inferenceEngine = new LlamaCppApiEngine();

// Clear the chat as soon as we mount
onMounted(() => {
  nextTick(clearCookies);
});

// Update the chat when the route changes
watch(
  () => route.params.id as string,
  async (newId: string) => {
    await setChat(newId);
  },
  { immediate: true },
);

/* Helper functions */

// Set the name of the chat based on the first sentence
async function setChatName(first_sentence: string) {
  // Get our chat id
  const chatId = chatRef.value!.id;
  try {
    const title = await inferChatTopic(first_sentence);
    await chatsStore.updateChat(chatId, { title });
    // Update the chat title state
    chatRef.value!.title = title;
  } catch (error) {
    console.error('pages::Chat.vue::setChatName - error', error);
  }
}

// Scroll to the bottom of the chat when new messages are added
const scrollBottom = () => {
  scrollAreaRef.value?.lastElementChild?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
};

// Generate a new response from the AI
async function generatePersonaMessage() {
  if (chatRef.value === undefined) {
    return;
  }

  const chatId = chatRef.value.id;
  // const chatTags = chatRef.value.tags;
  const username = chatRef.value.username;
  const messages = JSON.parse(JSON.stringify(chatRef.value.messages));
  const persona = chatRef.value.persona;

  const modelId = chatRef.value.modelId;
  const model = modelsStore.models.find((model) => model.id === modelId);

  if (model === undefined) {
    console.error('Model not available');
    return;
  }

  // Create a new message to encapsulate our response
  const response: UIMessage = {
    author: 'ai',
    role: persona.role,
    content: '',
    stopped: false,
    error: null,
  };

  chatRef.value.messages = [...chatRef.value.messages, response];

  try {
    // Set loading state
    isLoadingRef.value = true;

    // NOTE: assuming last message is guaranteed to be non-empty and the user's last message
    // Get the last message from the user
    // const lastMessage = messages[messages.length - 1];
    // const searchResultMessages: Message[] = [];
    // const searchResults = await knowledgeStore.searchDocuments(lastMessage.content, chatTags);
    // searchResults.forEach((result) => {
    //   searchResultMessages.push({
    //     role: 'search-result',
    //     content: result.content,
    //   });
    // });

    // Expand all the messages to inline any compatible attachments
    const expandedMessages = messages
      .map((message: UIMessage): Message[] => {
        const ret = [];
        // Push any attachments as messages ahead of the message itself
        message.attachments?.forEach((attachment) => {
          if (attachment.content) {
            ret.push({
              role: 'attachment',
              content: `[${attachment.title}](${attachment.content})`,
            });
          }
          // else if (attachment.documentId) {
          //   ret.push({
          //     role: 'attachment',
          //     content: `[${attachment.title}](document-id-${attachment.documentId})`,
          //   });
          // }
        });

        // Push what search results we found based on the message
        // TODO: this should probably be a more generic tool-call or llm-chain-link
        // TODO: this should probably link back to the document id
        // TODO: I should probably write these below messages in the log
        //  Really these search results should get attached to the message that
        //   lead to them being queried
        // if (message.searchResults) {
        //   message.searchResults.forEach((result: Message) => {
        //     ret.push({
        //       role: 'search-result',
        //       content: result.content,
        //     });
        //   });
        // }

        // Push the message itself
        ret.push(message);
        return ret;
      })
      .flat();

    // Append the search results to the messages
    const allMessages: Message[] = [...expandedMessages /*...searchResultMessages */];

    // Generate a stream of responses from the AI
    for await (const output of inferenceEngine.generateAnswer(allMessages, model, persona, username, false)) {
      const stopped = output.stopped;
      let content = output.content;
      if (!stopped) {
        content += ' *[writing ...]*';
      }
      // Update the local state include updates
      response.content = content;
      response.stopped = stopped;

      chatRef.value.messages = [...chatRef.value.messages];
      // Scroll to the bottom of the chat
      scrollBottom();
    }
    // A successful response! Append the chat to long term storage.
    await chatsStore.appendModelResponse(chatId, response.content, [] /*searchResults*/);
  } catch (error) {
    console.error('pages::Chat.vue::generatePersonaMessage - error', error);
    response.error = error;
  } finally {
    // Done! update the local state to reflect the end of the process
    isLoadingRef.value = false;
    chatRef.value.messages = [...chatRef.value.messages];
  }
}

// TODO: arbitrary message regeneration
// Regenerate the last message from the AI
async function regenerateMessage() {
  if (chatRef.value === undefined) {
    return;
  }

  // we discard the last message if it's from the AI, and regenerate
  const messages = chatRef.value.messages;
  const lastMessage = messages.at(-1)!;
  if (lastMessage.author !== 'user') {
    const chatId = chatRef.value.id;
    // Update the local state
    chatRef.value.messages.pop();
    // Update the chat state
    await chatsStore.popChatMessages(chatId);
  }
  await generatePersonaMessage();
}

async function sendMessage({ content, attachments }: SendMessageParams) {
  if (chatRef.value === undefined) {
    return;
  }

  const chatId = chatRef.value.id;

  // Append the new message to the chat history and push to local state
  const newMessage = await chatsStore.appendUserMessage(chatId, content, attachments);
  chatRef.value.messages.push({ ...newMessage, stopped: true, error: null });

  // Scroll to the bottom of the chat
  scrollBottom();

  // Generate a response from the AI
  await generatePersonaMessage();
}

// Set a chat by its ID
async function setChat(chatId: string) {
  const loadedChat = chatsStore.getChat(chatId);

  if (!loadedChat) {
    $q.notify({ message: 'Chat not found', color: 'red' });
    await router.push({ name: 'new-chat' });
    return;
  }

  // Load messages and remove potential previous errors
  loadedChat.messages = loadedChat.messages.map((message) => ({ ...message, stopped: true, error: null }));

  chatRef.value = loadedChat;

  // Set the chat title if it's not set
  const title = loadedChat.title;
  if (title === defaultChatTopic || title === '') {
    // Set the chat name based on the first message
    await setChatName(loadedChat.messages[0].content);
  }

  // Determine if there is a message we need to respond to
  const lastMessage = loadedChat.messages.at(-1);
  if (lastMessage?.author === 'user') {
    await generatePersonaMessage();
  }
  setTimeout(() => scrollBottom(), 50);
}

async function updateChatMessageContent(messageIndex: number, content: string, initialContent: string) {
  const chatId = chatRef.value!.id;
  try {
    await chatsStore.updateChatMessageContent(chatId, messageIndex, content);
  } catch (error) {
    console.error('updateChatMessageContent: ', error);
    // Reset the content to the initial content
    chatRef.value!.messages[messageIndex].content = initialContent;
    $q.notify('Failed to update message content');
  }
}

async function copyMessage(message: UIMessage) {
  await copyToClipboard(message.content);
  $q.notify('Message copied to clipboard');
}

const editMessage = (message: any) => {
  enableEditRef.value = true;

  setTimeout(() => {
    message.$el.click();
  }, 50);
};

async function clearCookies() {
  // Clear the slots
  inferenceEngine.clearSlots();
  // Clear the cookies from aleph
  await axios.get('https://curated.aleph.cloud/change-pool', {
    withCredentials: true,
  });
}

// function openKnowledgeUploader() {
//   showKnowledgeUploaderRef.value = true;
// }

// TODO: Replace this by using dayjs
function formatDate(d: Date | undefined) {
  if (!d) d = new Date();
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() / 1000 - d.getTime() / 1000;

  let unit: DateUnitOptions = 'hours';
  let txtUnit = 'h';
  if (timeDiff < 60) {
    unit = 'seconds';
    txtUnit = 's';
  } else if (timeDiff < 3600) {
    unit = 'minutes';
    txtUnit = 'm';
  } else if (timeDiff < 86400) {
    unit = 'hours';
    txtUnit = 'h';
  } else if (timeDiff < 2592000) {
    unit = 'days';
    txtUnit = 'd';
  } else if (timeDiff > 2592000) {
    unit = 'months';
    txtUnit = 'month';
  }

  const diff = date.getDateDiff(currentDate, d, unit);
  return diff + txtUnit;
}
</script>
<style>
/* Ensure message input expands to fill available space */
message-input {
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
    right: 0;
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
      right: 0;
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

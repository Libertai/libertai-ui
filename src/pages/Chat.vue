<template>
  <q-page v-if="chatRef" class="column align-items-center">
    <div ref="scrollAreaRef" class="col-grow overflow-auto" style="max-height: calc(100vh - 190px)">
      <!-- Display message history -->
      <q-list class="col-grow max-sm:tw-m-6 sm:tw-m-12">
        <!-- eslint-disable-next-line vue/valid-v-for -->
        <q-item
          v-for="(message, message_index) in chatRef.messages"
          :class="{
            'bg-white': !$q.dark.mode && message.author === 'user',
            'bg-secondary': !$q.dark.mode && message.author !== 'user',
          }"
          class="q-py-md q-my-md max-sm:tw-mx-2 sm:tw-mx-12 items-start dyn-container chat-item rounded-borders"
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

              <span class="bull-date">{{ dayjs().to(message.timestamp) }}</span>
            </q-item-label>
            <!-- Display any attachments -->
            <q-item-label v-if="message.attachments && message.attachments.length > 0">
              <q-chip
                v-for="attachment in message.attachments"
                :key="attachment.id"
                class="tw-mr-1 bg-primary text-white"
                icon="img:icons/attachment.svg"
              >
                {{ attachment.title }}
              </q-chip>
            </q-item-label>
            <!-- Display the content of the message -->
            <q-item-label v-if="message.thought && message.thought.length > 1" class="tw-block">
              <q-card
                :ref="'thought-' + message_index"
                :class="
                  'thought flat bordered ' +
                  ((!message.isLoading || message.stopped) && message_index !== chatRef.messages.length - 1
                    ? 'minimize_thought'
                    : '')
                "
              >
                <q-card-section class="header">
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <h4>Thought Process...</h4>
                    </div>
                    <div class="col-auto">
                      <q-btn flat @click="showHideThought(($refs['thought-' + message_index] as any)[0])">
                        <q-icon name="remove" />
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
                <q-card-section class="content">
                  {{ message.thought }}
                </q-card-section>
              </q-card>
            </q-item-label>
            <q-item-label class="tw-block">
              <MarkdownRenderer
                :class="message.author === 'user' ? '' : 'message-content'"
                :content="
                  message.content +
                  (!message.stopped && message.isLoading && message.content !== '' ? ' *[writing ...]*' : '')
                "
              />
              <!-- Display the loading spinner if the message is still loading -->
              <q-spinner-bars v-if="!message.stopped && message.isLoading" color="white" size="2em" />
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
              v-if="!message.isLoading && message.author === 'ai' && message_index === chatRef.messages.length - 1"
              dense
              flat
              icon="refresh"
              size="sm"
              @click="regenerateMessage()"
            >
              <q-tooltip>Regenerate</q-tooltip>
            </q-btn>
            <q-btn
              v-if="message.isLoading && message.author === 'ai' && message_index === chatRef.messages.length - 1"
              dense
              flat
              size="sm"
              @click="stopGeneration()"
            >
              <ltai-icon name="stop" />
              <q-tooltip>Stop</q-tooltip>
            </q-btn>
            <q-btn
              v-if="message.thought && message.thought.length > 1"
              dense
              flat
              icon="psychology"
              size="sm"
              @click="showHideThought(($refs['thought-' + message_index] as any)[0])"
            >
              <q-tooltip>Thought Process</q-tooltip>
            </q-btn>
            <!-- Allow copying the message to the clipboard -->
            <q-btn dense flat size="sm" @click="copyMessage(message)">
              <ltai-icon name="svguse:icons.svg#copy" />
              <q-tooltip>Copy</q-tooltip>
            </q-btn>
            <q-btn dense flat size="sm" @click="editMessage(($refs['message-' + message_index] as any)[0])">
              <ltai-icon name="svguse:icons.svg#pencil" />
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
          </div>
        </q-item>
      </q-list>
    </div>

    <div v-if="!autoScrollEnabled" class="tw-mx-4 tw-mb-2 tw-flex tw-justify-center">
      <q-btn
        color="primary"
        round
        size="sm"
        icon="keyboard_arrow_down"
        @click="scrollToBottomAndEnable"
      />
    </div>

    <div class="tw-mx-4">
      <message-input :is-loading="isLoadingRef" class="col" @send-message="sendMessage" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import 'highlight.js/styles/devibeans.css';
import { LlamaCppApiEngine, Message } from '@libertai/libertai-js';
import axios from 'axios';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import dayjs from 'dayjs';
import { copyToClipboard, useQuasar } from 'quasar';
import MarkdownRenderer from 'src/components/MarkdownRenderer.vue';
import MessageInput from 'src/components/MessageInput.vue';
import { Chat, SendMessageParams, UIMessage } from 'src/types/chats';
import { KnowledgeSearchResult } from 'src/types/knowledge';
import { defaultChatTopic, inferChatTopic } from 'src/utils/chat';
import { searchDocuments } from 'src/utils/knowledge/embedding';
import { getPersonaAvatarUrl } from 'src/utils/personas';
import { useChatsStore } from 'stores/chats';
import { useKnowledgeStore } from 'stores/knowledge';
import { useModelsStore } from 'stores/models';
import { useSettingsStore } from 'stores/settings';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

// App state
const chatsStore = useChatsStore();
const modelsStore = useModelsStore();
const settingsStore = useSettingsStore();
const knowledgeStore = useKnowledgeStore();

// Local page state
const isLoadingRef = ref(false);
const scrollAreaRef = ref<HTMLDivElement>();
const enableEditRef = ref(false);
const shouldStopGeneration = ref(false);
const autoScrollEnabled = ref(true);

const chatRef = ref<Chat>();

// Instance of an inference engine
const inferenceEngine = new LlamaCppApiEngine();

// Clear the chat as soon as we mount
onMounted(() => {
  nextTick(clearCookies);
  
  nextTick(() => {
    if (scrollAreaRef.value) {
      scrollAreaRef.value.addEventListener('scroll', checkScrollPosition);
    }
  });
});

onUnmounted(() => {
  if (scrollAreaRef.value) {
    scrollAreaRef.value.removeEventListener('scroll', checkScrollPosition);
  }
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
    chatsStore.updateChat(chatId, { title });
    // Update the chat title state
    chatRef.value!.title = title;
  } catch (error) {
    console.error('pages::Chat.vue::setChatName - error', error);
  }
}

const checkScrollPosition = () => {
  if (!scrollAreaRef.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.value;
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
  
  if (!isAtBottom && autoScrollEnabled.value) {
    autoScrollEnabled.value = false;
  } else if (isAtBottom && !autoScrollEnabled.value) {
    autoScrollEnabled.value = true;
  }
};

// Scroll to the bottom of the chat when new messages are added
const scrollBottom = () => {
  if (!autoScrollEnabled.value) return;
  
  scrollAreaRef.value?.lastElementChild?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
};

const scrollToBottomAndEnable = () => {
  autoScrollEnabled.value = true;
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
  const username = chatRef.value.username;
  const messages: UIMessage[] = JSON.parse(JSON.stringify(chatRef.value.messages));
  const knowledgeBaseIds = chatRef.value.knowledgeBases;
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
    thought: '',
    stopped: false,
    error: null,
    isLoading: true,
  };

  chatRef.value.messages = [...chatRef.value.messages, response];

  try {
    // Set loading state
    isLoadingRef.value = true;

    let knowledgeSearchResults: KnowledgeSearchResult[] = [];

    // Finding related knowledge document chunks
    if (knowledgeBaseIds.length > 0) {
      const documents = knowledgeStore.getDocumentsFromBases(knowledgeBaseIds);
      const lastUserMessage = messages.findLast((message) => message.author === 'user')!;
      knowledgeSearchResults = await searchDocuments(lastUserMessage.content, documents);
    }

    // Expand all the messages to inline any compatible attachments
    const allMessages = messages
      .map((message: UIMessage): Message[] => {
        const ret = [];
        // Push any attachments as messages ahead of the message itself
        message.attachments?.forEach((attachment) => {
          ret.push({
            role: 'attachment',
            content: `[${attachment.title}](${attachment.content})`,
          });
        });

        // Push the message itself
        ret.push(message);
        return ret;
      })
      .flat();

    // Generate a stream of responses from the AI
    for await (const output of inferenceEngine.generateAnswer(
      allMessages,
      model,
      persona,
      knowledgeSearchResults.map((result) => result.content),
      username,
      false,
    )) {
      const stopped = output.stopped || shouldStopGeneration.value;

      // Update the local state include updates
      response.content = output.content;
      response.thought = output.thought;
      response.stopped = stopped;

      if (stopped) {
        shouldStopGeneration.value = false;
        response.isLoading = false;
        break;
      }

      chatRef.value.messages = [...chatRef.value.messages];
      // Scroll to the bottom of the chat
      scrollBottom();
    }
    // A successful response! Append the chat to long term storage.
    chatsStore.appendModelResponse(chatId, response.content, response.thought!, []);
  } catch (error) {
    console.error('generatePersonaMessage error: ', error);
    response.error = error;
  } finally {
    // Done! update the local state to reflect the end of the process
    isLoadingRef.value = false;
    response.isLoading = false;
    chatRef.value.messages = [...chatRef.value.messages];
  }
}

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
    chatsStore.popChatMessages(chatId);
  }
  await generatePersonaMessage();
}

function stopGeneration() {
  if (chatRef.value === undefined) {
    return;
  }

  shouldStopGeneration.value = true;
}

async function sendMessage({ content, attachments }: SendMessageParams) {
  if (chatRef.value === undefined) {
    return;
  }

  const chatId = chatRef.value.id;

  // Append the new message to the chat history and push to local state
  const newMessage = chatsStore.appendUserMessage(chatId, content, attachments);
  chatRef.value.messages.push({ ...newMessage, stopped: true, error: null });

  // Scroll to the bottom of the chat
  nextTick(scrollBottom);

  // Generate a response from the AI
  await generatePersonaMessage();
}

// Set a chat by its ID
async function setChat(chatId: string) {
  const loadedChat = chatsStore.getChat(chatId);

  if (!loadedChat) {
    $q.notify({ message: 'Chat not found', color: 'negative' });
    await router.push({ name: 'new-chat' });
    return;
  }

  // Load messages and remove potential previous errors
  loadedChat.messages = loadedChat.messages.map((message) => ({ ...message, stopped: true, error: null }));

  chatRef.value = JSON.parse(JSON.stringify(loadedChat));

  // Set the chat title if it's not set
  const title = loadedChat.title;
  if (title === defaultChatTopic || title === '') {
    // Set the chat name based on the first message
    setChatName(loadedChat.messages[0].content);
  }

  // Determine if there is a message we need to respond to
  const lastMessage = loadedChat.messages.at(-1);
  if (lastMessage?.author === 'user') {
    await generatePersonaMessage();
  }
  setTimeout(() => scrollBottom(), 50);
}

function updateChatMessageContent(messageIndex: number, content: string, initialContent: string) {
  const chatId = chatRef.value!.id;
  try {
    chatsStore.updateChatMessageContent(chatId, messageIndex, content);
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

function showHideThought(element: any) {
  if (!element?.$el) return;

  if (isVisible(element.$el)) {
    element.$el.classList.add('minimize_thought');
  } else {
    element.$el.classList.remove('minimize_thought');
  }
}

function isVisible(element: any) {
  return element.offsetParent;
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

.thought {
  background-color: #dcdcdc;
  margin-bottom: 10px;
  color: #464242;
  .header {
    padding-top: 0;
    padding-bottom: 0;
  }
  .content {
    padding-top: 0;
  }
  h4 {
    font-weight: bold;
  }
  .hide {
    display: none;
  }
}
.minimize_thought {
  display: none;
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

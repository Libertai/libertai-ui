<template>
  <q-page class="column align-items-center">
    <div ref="scrollAreaRef" class="col-grow overflow-auto" style="max-height: calc(100vh - 190px)">
      <!-- Display message history -->
      <q-list class="col-grow q-ma-xl">
        <!-- Determine styling based on the role of the message (if it's the user or the AI) -->
        <q-item
          v-for="(message, message_index) in messagesRef"
          :key="message.id"
          :class="`q-py-md q-my-md ${$q.screen.gt.sm ? 'q-mx-xl' : 'q-mx-sm'} items-start dyn-container chat-item rounded-borders ${$q.dark.mode ? '' : message.role == usernameRef ? 'bg-white' : 'bg-secondary'}`"
        >
          <!-- Display the avatar of the user or the AI -->
          <q-item-section avatar>
            <q-avatar v-if="message.role == usernameRef">
              <img src="avatars/00057-2093295138.png" />
            </q-avatar>
            <q-avatar v-else>
              <img :src="personaRef.avatarUrl" />
            </q-avatar>
          </q-item-section>
          <!-- Edit message popup -- triggered on click if the edit mode is enabled -->
          <q-item-section :ref="'message-' + message_index" :style="`max-width: calc(960px - 56px);`">
            <q-popup-edit
              v-if="enableEditRef"
              v-slot="scope"
              v-model="message.content"
              auto-save
              @save="(v, iV) => updateChatMessageContent(message_index, v, iV)"
            >
              <strong>{{ message.role }}</strong>
              <q-input v-model="scope.value" autofocus autogrow counter dense />
            </q-popup-edit>
            <!-- Display the role of the user or the AI -->
            <q-item-label class="text-semibold q-mb-md">
              {{ message.role }}
              <span class="bull-date">{{ formatDate(message.timestamp) }}</span>
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
              <MarkdownRenderer
                :content="message.content"
                breaks
                :class="message.role == usernameRef ? '' : 'message-content'"
              />
              <!-- Display the loading spinner if the message is still loading -->
              <q-spinner-bars v-if="!message.stopped && isLoadingRef" color="white" size="2em" />
              <!-- Display the error message if the message errored  on generate -->
              <span v-if="!!message.error" class="text-warning">
                <q-tooltip>Error: {{ message.error.message }}</q-tooltip>
                <q-icon name="warning" /> There has been an error, please <a @click="regenerateMessage()">retry</a>.
              </span>
            </q-item-label>
          </q-item-section>
          <!-- Chat item toolbar -->
          <div class="absolute dyn-container chat-toolbar">
            <!-- Allow regenerating the last message from the AI if fully completed -->
            <q-btn
              v-if="!isLoadingRef && message_index == messagesRef.length - 1"
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
              dense
              flat
              :icon="`img:icons/svg/copy2${$q.dark.mode ? '_lighten' : ''}.svg`"
              size="sm"
              @click="copyMessage(message)"
            >
              <q-tooltip>Copy</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="`img:icons/svg/edit${$q.dark.mode ? '_lighten' : ''}.svg`"
              size="sm"
              @click="editMessage('message-' + message_index)"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
          </div>
        </q-item>
      </q-list>
    </div>

    <div class="row items-center q-mb-md q-mr-md">
      <!-- "+" icon for uploading files, shown only when knowledge search is enabled -->
      <q-btn
        v-if="enableKnowledgeRef"
        class="cursor-pointer q-mr-sm"
        flat
        icon="add"
        round
        style="margin-left: 16px"
        @click="openKnowledgeUploader"
      />

      <q-chip
        v-for="attachment in attachmentsRef"
        :key="attachment.id"
        removable
        @remove="removeAttachment(attachment)"
      >
        {{ attachment.title }}
      </q-chip>
      <message-input
        ref="inputRef"
        v-model="inputTextRef"
        :isLoading="isLoadingRef"
        class="col"
        @sendMessage="sendMessage"
      />
    </div>

    <!-- Enable edit mode -->
    <!--<div class="fixed-bottom-right q-mb-md q-mr-md" style="z-index: 10">
      <div class="q-gutter-x-md" style="display: flex; align-items: center; justify-content: flex-end">
        <q-checkbox v-model="enableEditRef" left-label>
          <q-tooltip anchor="top right" class="bg-primary" self="bottom right">
            When this is activated, just click on a message to start editing it.
          </q-tooltip>
          Enable edits
        </q-checkbox>
      </div>
    </div>-->
    <!-- This should really not pass the ref, but it's a quick fix for now -->
    <q-dialog v-model="showKnowledgeUploaderRef" position="bottom">
      <KnowledgeStoreUploader
        :chatRef="chatRef"
        auto-upload
        label="Auto KnowledgeStoreUploader"
        multiple
        url="http://localhost:4444/upload"
        @attachment-added="addAttachment"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import 'highlight.js/styles/devibeans.css';
import { copyToClipboard, useQuasar, date } from 'quasar';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { defaultChatTopic, inferChatTopic } from 'src/utils/chat';

// LlamaCppApiEngine
import { LlamaCppApiEngine } from '@libertai/libertai-js';

// Local state
import { useChatsStore } from 'src/stores/chats-store';
import { useModelsStore } from 'src/stores/models-store';
import { useKnowledgeStore } from 'src/stores/knowledge-store';
import { useAccount } from 'src/stores/account';
import { usePersonasStore } from 'src/stores/personas-store';

// Components
import MarkdownRenderer from 'src/components/MarkdownRenderer.vue';
import MessageInput from 'src/components/MessageInput.vue';
import axios from 'axios';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

// App state
const account = useAccount();
const chatsStore = useChatsStore();
const modelsStore = useModelsStore();
const knowledgeStore = useKnowledgeStore();
const personasStore = usePersonasStore();

// Local page state
const inputTextRef = ref('');
const isLoadingRef = ref(false);
const hasResetRef = ref(false);
const inputRef = ref(null);
const scrollAreaRef = ref(null);
const enableEditRef = ref(false);
const enableKnowledgeRef = ref(true);
const showKnowledgeUploaderRef = ref(false);
const attachmentsRef = ref([]);

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

// Update whether we should show the knowledge uploader based on whether the user is connected
watch(
  () => account.active,
  (active) => {
    enableKnowledgeRef.value = active;
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

function addAttachment(attachmentEvent) {
  let attachment = JSON.parse(JSON.stringify(attachmentEvent));
  attachmentsRef.value.push(attachment);
}

async function removeAttachment(attachment) {
  // Remove the attachment from the knowledge store
  await knowledgeStore.removeDocument(attachment.documentId);
  let index = attachmentsRef.value.indexOf(attachment);
  attachmentsRef.value.splice(index, 1);
}

// Set the name of the chat based on the first sentence
async function setChatName(first_sentence) {
  // Get our chat id
  let chatId = chatRef.value.id;
  try {
    const title = await inferChatTopic(first_sentence);
    await chatsStore.updateChatTitle(chatId, title);
    // Update the chat title state
    chatRef.value.title = title;
  } catch (error) {
    console.error('pages::Chat.vue::setChatName - error', error);
  }
}

// Scroll to the bottom of the chat when new messages are added
async function scrollBottom() {
  scrollAreaRef.value.lastElementChild.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
}

// Generate a new response from the AI
async function generatePersonaMessage() {
  let chatId = chatRef.value.id;
  let chatTags = chatRef.value.tags;
  let messages = JSON.parse(JSON.stringify(messagesRef.value));
  let persona = personaRef.value;
  let username = usernameRef.value;
  let model = chatRef.value.model;

  // Create a new message to encapsulate our response
  let response = {
    role: persona.name,
    content: '',
    stopped: false,
    error: null,
  };

  // And push it to the local state so that it renders
  messagesRef.value = [...messagesRef.value, response];
  chatRef.value.messages = messagesRef.value;

  try {
    // Set loading state
    isLoadingRef.value = true;
    hasResetRef.value = false;

    // NOTE: assuming last message is guaranteed to be non-empty and the user's last message
    // Get the last message from the user
    let lastMessage = messages[messages.length - 1];
    let searchResultMessages = [];
    let searchResults = await knowledgeStore.searchDocuments(lastMessage.content, chatTags);
    searchResults.forEach((result) => {
      searchResultMessages.push({
        role: 'search-result',
        content: result.content,
      });
    });

    // Expand all the messages to inline any compatible attachments
    const expandedMessages = messages
      .map((message) => {
        let ret = [];
        // Push any attachments ahead of the message
        if (message.attachments) {
          message.attachments.forEach((attachment) => {
            if (attachment.content) {
              ret.push({
                role: 'attachment',
                content: `[${attachment.title}](${attachment.content})`,
              });
            } else if (attachment.documentId) {
              ret.push({
                role: 'attachment',
                content: `[${attachment.title}](document-id-${attachment.documentId})`,
              });
            }
          });
        }

        // Push what search results we found based on the message
        // TODO: this should probably be a more generic tool-call or llm-chain-link
        // TODO: this should probably link back to the document id
        // TODO: I should probably write these below messages in the log
        //  Really these search results should get attached to the message that
        //   lead to them being queried
        if (message.searchResults) {
          message.searchResults.forEach((result) => {
            ret.push({
              role: 'search-result',
              content: result.content,
            });
          });
        }
        // Push the message itself
        ret.push(message);
        return ret;
      })
      .flat();

    // Append the search results to the messages
    const allMessages = [...expandedMessages, ...searchResultMessages];

    // Generate a stream of responses from the AI
    for await (const output of inferenceEngine.generateAnswer(
      allMessages,
      model,
      persona,
      // Set the target to the user
      username,
      // set to false to disable logging
      false,
    )) {
      let stopped = output.stopped;
      let content = output.content;
      if (!stopped) {
        content += ' *[writing ...]*';
      }
      // Update the local state include updates
      response.content = content;
      response.stopped = stopped;

      messagesRef.value = [...messagesRef.value];
      // Scroll to the bottom of the chat
      nextTick(scrollBottom);
    }
    // A successful response! Append the chat to long term storage.
    await chatsStore.appendModelResponse(chatId, response.content, searchResults);
  } catch (error) {
    console.error('pages::Chat.vue::generatePersonaMessage - error', error);
    response.error = error;
  } finally {
    // Done! update the local state to reflect the end of the process
    isLoadingRef.value = false;
    hasResetRef.value = false;
    messagesRef.value = [...messagesRef.value];
  }
}

// TODO: arbitrary message regeneration
// Regenerate the last message from the AI
async function regenerateMessage() {
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
  let chatId = chatRef.value.id;
  let inputText = inputTextRef.value;
  const attachments = JSON.parse(JSON.stringify(attachmentsRef.value));

  // Wipe the input text
  inputTextRef.value = '';
  // Wipe the attachments
  attachmentsRef.value = [];

  nextTick(scrollBottom);

  if (!content.trim()) return;

  if (content.trim() === '') return;

  // Append the new message to the chat history and push to local state
  let newMessage = await chatsStore.appendUserMessage(chatId, inputText, attachments);
  messagesRef.value.push({ ...newMessage, stopped: true, error: null });
  chatRef.value.messages = messagesRef.value;

  // Scroll to the bottom of the chat
  nextTick(scrollBottom);

  // Generate a response from the AI
  await generatePersonaMessage();
}

// Set a chat by its ID
async function setChat(chatId) {
  // This is annoying but we need to set whether the user is connected
  enableKnowledgeRef.value = account.active;

  // Load the chat from the store and set it
  chatRef.value = await chatsStore.readChat(chatId);
  if (!chatRef.value) {
    console.error('pages::Chat.vue::setChat - chat not found');
    await router.push({ name: 'new-chat' });
    return;
  }

  personasStore.persona = chatRef.value.persona;
  let persona = chatRef.value.persona;
  watch(personasStore.persona, async (persona) => {
    personaRef.value = persona;
  });

  // Extract the chat properties
  let title = chatRef.value.title;
  let username = chatRef.value.username;
  // Load messages, mapping over with additional properties we need in the UI
  let messages = chatRef.value.messages.map((message) => {
    // Set stopped to true
    message.stopped = true;
    // Set error to null
    message.error = null;
    return message;
  });

  // Set the selected model for the chat by its URL
  let modelApiUrl = chatRef.value.model.apiUrl;
  modelsStore.setModelByURL(modelApiUrl);

  // Set the local messages state
  messagesRef.value = messages;

  // Set the local persona state
  personaRef.value = persona;

  // Set the local username state
  usernameRef.value = username;

  // Set the chat title if it's not set
  if (title === defaultChatTopic || title === '') {
    // Set the chat name based on the first message
    setChatName(messages[0].content);
  }

  // Determine if there are messages we need to respond to
  // NOTE: this is assuming all chats should be initiated by the user
  if (messages.length % 2 === 1) {
    await generatePersonaMessage();
  }
  nextTick(scrollBottom);
}

async function updateChatMessageContent(messageIndex, content, initialContent) {
  let chatId = chatRef.value.id;
  try {
    await chatsStore.updateChatMessageContent(chatId, messageIndex, content);
  } catch (error) {
    console.error('pages::Chat.vue::updateChatMessageContent - error', error);
    // Reset the content to the initial content
    messagesRef.value[messageIndex].content = initialContent;
    // Alert the user
    $q.notify('Failed to update message content');
  }
}

async function copyMessage(message) {
  await copyToClipboard(message.content);
  $q.notify('Message copied to clipboard');
}

async function editMessage(message_id) {
  this.enableEditRef = true;

  setTimeout(() => {
    this.$refs[message_id][0].$el.click();
  }, 50);
}

async function clearCookies() {
  // Clear the slots
  inferenceEngine.clearSlots();
  // Clear the cookies from aleph
  await axios.get('https://curated.aleph.cloud/change-pool', {
    withCredentials: true,
  });
  // Set the reset flag
  hasResetRef.value = true;
}

function openKnowledgeUploader() {
  showKnowledgeUploaderRef.value = true;
}

function formatDate(d) {
  if (!d) d = new Date();
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() / 1000 - d.getTime() / 1000;

  let unit = 'hour';
  let txtUnit = 'h';
  if (timeDiff < 60) {
    unit = 'second';
    txtUnit = 's';
  } else if (timeDiff < 3600) {
    unit = 'minute';
    txtUnit = 'm';
  } else if (timeDiff < 86400) {
    unit = 'hour';
    txtUnit = 'h';
  } else if (timeDiff < 2592000) {
    unit = 'day';
    txtUnit = 'd';
  } else if (timeDiff > 2592000) {
    unit = 'month';
    txtUnit = 'month';
  }

  const diff = date.getDateDiff(currentDate, d, unit);
  return diff + txtUnit;
}
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

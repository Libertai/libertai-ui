<template>
  <q-page class="column align-items-center">
    <div class="col-grow overflow-auto" style="max-height: calc(100vh - 190px)" ref="scrollArea">
      <q-list class="col-grow">
        <q-item v-for="(message, message_index) in messages" :key="message.id"
          :class="`q-py-lg items-start dyn-container chat-item ${message.username == user.username ? 'bg-dark' : ''}`">
          <q-item-section avatar>
            <q-avatar v-if="message.username == user.username">
              <img src="avatars/00057-2093295138.png" />
            </q-avatar>
            <q-avatar v-else>
              <img :src="chat.prompt.avatar" />
            </q-avatar>
          </q-item-section>
          <q-item-section :style="`max-width: calc(960px - 56px);`">
            <q-popup-edit v-model="message.content" auto-save v-slot="scope" v-if="enableEdit">
              <strong>{{ message.username }}</strong>
              <q-input v-model="scope.value" dense autofocus counter autogrow />
            </q-popup-edit>
            <q-item-label class="text-semibold">
              {{ message.username.replace('user', 'You').replace('assistant', 'Libertai') }}
            </q-item-label>
            <q-item-label style="display: block;">
              <MarkdownRenderer :content="message.content" breaks />
              <q-spinner-bars color="white" size="2em" v-if="message.unfinished && isLoading" />
              <span class="text-warning" v-if="message.in_error">
                <q-tooltip>Error: {{ message.error_message }}</q-tooltip>
                <q-icon name="warning" /> There has been an error, please <a @click="regenerateMessage()">retry</a>.
              </span>
            </q-item-label>
          </q-item-section>
          <div class="absolute dyn-container chat-toolbar">
            <q-btn @click="regenerateMessage()" icon="refresh" dense flat size="sm"
              v-if="(!isLoading) && (message_index == messages.length - 1)">
              <q-tooltip>Regenerate</q-tooltip>
            </q-btn>
            <q-btn @click="copyMessage(message)" icon="content_copy" dense flat size="sm">
              <q-tooltip>Copy</q-tooltip>
            </q-btn>
          </div>
        </q-item>

      </q-list>

    </div>

    <message-input :isLoading="isLoading" @sendMessage="sendMessage" v-model="inputText" ref="input" />
    <q-checkbox v-model="enableEdit" left-label class="q-mr-lg q-mb-md fixed-bottom-right">
      <q-tooltip anchor="top right" class="bg-primary" self="bottom right">When this is activated, just click on a
        message to start editing it.</q-tooltip>
      Enable edits
    </q-checkbox>
  </q-page>
</template>

<script>
import 'highlight.js/styles/devibeans.css'
import { is, useQuasar, copyToClipboard } from 'quasar'
import { defineComponent, ref, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChats } from '../stores/chats'
import { usePrompts } from '../stores/prompts'
import { useModels } from '../stores/models'

import { getChatName, createMessage, generateAnswer } from '../utils/chat'

import MarkdownRenderer from '../components/MarkdownRenderer.vue';
import MessageInput from '../components/MessageInput.vue';
import axios from 'axios';
import router from '../router'
import models from 'src/utils/models'

console.log(nextTick)

export default defineComponent({
  name: 'ChatPage',
  components: {
    MarkdownRenderer,
    MessageInput
  },
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()
    const chat = ref()
    const chats = useChats()
    const prompts = usePrompts()
    const models = useModels()
    const inputText = ref('')
    const isLoading = ref(false)
    const hasReset = ref(false)
    const input = ref(null)
    const scrollArea = ref(null)
    const enableEdit = ref(false)

    const prompt = ref()
    const user = ref()
    const persona = ref()
    const messages = ref([])

    async function setChatName(first_sentence) {
      const title = await getChatName(first_sentence, chat.value.model);
      console.log(title);
      chat.value.title = title;
    }

    async function scrollBottom() {
      scrollArea.value.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end" });
      // scrollArea.value.scrollTop = scrollArea.value.scrollHeight;
    }

    async function generatePersonaMessage() {
      const persona = prompt.value.users[1];
      let currentMessage = null;
      // scrollBottom();
      await chats.saveToStorage();

      inputText.value = '';
      // nextTick(scrollBottom);

      currentMessage = createMessage(persona._id, persona.username, "");
      currentMessage.unfinished = true;
      messages.value = [...messages.value, currentMessage];
      chat.value.messages = messages.value;

      try {
        isLoading.value = true;
        hasReset.value = false;
        // this.activePrompt.typingUsers = [persona._id];

        for await (const output of generateAnswer(messages.value.slice(0, -1), prompt.value, chat.value.model)) {
          console.log(output);
          currentMessage.content = output.content;
          currentMessage.unfinished = output.unfinished;
          messages.value = [...messages.value];
          // nextTick(scrollBottom);
        }
      }
      catch (error) {
        console.error("Error:", error);
        currentMessage.in_error = true;
        currentMessage.error_message = error.message;
      }
      isLoading.value = false;
      // currentMessage.unfinished = false;
      messages.value = [...messages.value];
      // current_chat.messages = [...current_chat.messages];
      await chats.saveToStorage();
      // activePrompt.typingUsers = [];
      // activePrompt.pmessages = this.messages;

      // this.messages.push(createMessage(generateAnswer(message, this.model), 'ai'));
      // nextTick(scrollBottom);
    }

    async function regenerateMessage() {
      // we discard the last message if it's from the AI, and regenerate
      const lastMessage = messages.value[messages.value.length - 1];
      console.log(lastMessage);
      if (lastMessage.username !== user.value.username) {
        messages.value.pop();
        messages.value = [...messages.value];
        chat.value.messages = messages.value;
      }
      await generatePersonaMessage();
      // const messages = chat.value.messages;
      // const lastMessage = messages.value[messages.value.length-1];
      // if (lastMessage.username !== this.user.username) {
      //     // deleteMessage(lastMessage, messages);
      //     // messages.value = [...messages.value];
      //     chat.value.messages = [...this.current_chat.messages];
      // }
      // await this.generatePersonaMessage();
    }

    async function sendMessage(content) {
      console.log(content)

      nextTick(scrollBottom)

      if (!content.trim())
        return;

      if (content == "/clear") {
        clearChat();
        return;
      }

      if (content.trim() === "")
        return;

      const userMessage = createMessage(user.value._id, user.value.username, content)
      console.log(userMessage)

      messages.value.push(userMessage)
      await generatePersonaMessage()
    }

    async function setChat(chatId) {
      chat.value = await chats.getChat(chatId)
      if (chat.value === undefined) {
        await router.push({ name: 'new-chat' })
        return
      }
      models.setModelByURL(chat.value.model.apiUrl)
      messages.value = chat.value.messages

      if (chat.value.prompt !== undefined)
        prompt.value = chat.value.prompt
      else
        prompt.value = JSON.parse(JSON.stringify(prompts.prompts[0]))

      user.value = prompt.value.users[0]
      persona.value = prompt.value.users[1]

      if (chat.value.title === '') {
        setChatName(chat.value.messages[0].content)
      }

      if (chat.value.messages.length == 1) {
        await generatePersonaMessage()
      }
      nextTick(scrollBottom)
    }

    async function copyMessage(message) {
      await copyToClipboard(message.content)
      $q.notify('Message copied to clipboard')
    }

    async function clearCookies() {
      if (chat.value.model.slot_id !== undefined) {
        delete chat.value.model.slot_id;
      }
      await axios.get("https://curated.aleph.cloud/change-pool", {
        withCredentials: true
      });
      await axios.get("https://curated.aleph.cloud/change-pool", {
        withCredentials: true
      });
      hasReset.value = true;
    }

    onMounted(() => { nextTick(clearCookies) })

    watch(
      () => route.params.id,
      async newId => {
        await setChat(newId)
        messages.value = chat.value.messages
      }
    )

    watch(
      () => models.model,
      async newModel => {
        if (chat.value.model.apiUrl !== newModel.apiUrl) {
          chat.value.model = JSON.parse(JSON.stringify(newModel))
          $q.notify(`Changing current chat model to ${newModel.name}`)
        }
      }
    )

    setChat(route.params.id)

    return {
      scrollArea,
      chat,
      messages,
      user,
      persona,
      isLoading,
      input,
      inputText,
      sendMessage,
      enableEdit,
      regenerateMessage,
      copyMessage,
      chatId: route.params.id
    }
  }
})
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
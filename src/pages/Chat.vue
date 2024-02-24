<template>
  <q-page class="column align-items-center" ref="page">
    <q-list class="col-grow">
      <q-item v-for="message in messages" :key="message.id" class="q-py-lg items-start">
        <q-item-section avatar>
          <q-avatar v-if="message.username == user.username">
            <img src="avatars/00057-2093295138.png" />
          </q-avatar>
          <q-avatar v-else>
            <img :src="chat.prompt.avatar" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-semibold">
            {{ message.username }}
          </q-item-label>
          <q-item-label>
            <MarkdownRenderer :content="message.content" breaks />
          </q-item-label>
        </q-item-section>
      </q-item>
    
    </q-list>

    <q-input autogrow rounded standout v-model="inputText"
      label="Write your message here" autofocus
      bg-color="secondary" label-color="grey" input-class="text-white" class="q-pa-lg" ref="input">

      <template v-slot:append>
          <q-btn round dense flat icon="send" @click="sendMessage" color="white" />
      </template>
    </q-input>
  </q-page>
</template>
  
<script>
  import 'highlight.js/styles/devibeans.css'
  import { defineComponent, ref, watch, nextTick } from 'vue'
  import { useRoute } from 'vue-router'
  import { useChats } from '../stores/chats'
  import { usePrompts } from '../stores/prompts'

  import MarkdownRenderer from '../components/MarkdownRenderer.vue';

  import { getChatName, createMessage, generateAnswer } from '../utils/chat'

  console.log(nextTick)
  
  export default defineComponent({
    name: 'ChatPage',
    components: {
      MarkdownRenderer
    },
    setup() {
      const route = useRoute()
      const chat = ref()
      const chats = useChats()
      const prompts = usePrompts()
      const inputText = ref('')
      const isLoading = ref(false)
      const hasReset = ref(false)
      const input = ref(null);
      const page = ref(null);

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
        // page.value.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end" });
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

                for await (const new_content of generateAnswer(messages.value.slice(0,-1), prompt.value, chat.value.model)) {
                    console.log(new_content);
                    currentMessage.content = new_content;
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
            currentMessage.unfinished = false;
            messages.value = [...messages.value];
            // current_chat.messages = [...current_chat.messages];
            await chats.saveToStorage();
            // activePrompt.typingUsers = [];
            // activePrompt.pmessages = this.messages;

            // this.messages.push(createMessage(generateAnswer(message, this.model), 'ai'));
            // nextTick(scrollBottom);
        }

      async function regenerate() {
          const messages = chat.value.messages;
          const lastMessage = messages[messages.length-1];
          if (lastMessage.username !== this.user.username) {
              this.deleteMessage(lastMessage, messages);
              this.current_chat.messages = [...this.current_chat.messages];
          }
          await this.generatePersonaMessage();
      }

      async function sendMessage(event) {
        if (event.shiftKey) {
          return;
        }
        event.preventDefault()
        let content = inputText.value
        console.log(content)

        if (!content.trim())
          return;

        if (content == "/clear") {
          clearChat();
          return;
        }

        if (content.trim() === "")
          return;

        const userMessage = createMessage(user.value._id, user.value.username, content);
        console.log(userMessage)

        messages.value.push(userMessage);
        await generatePersonaMessage();

        input.value.nativeEl.focus();
        input.value.nativeEl.scrollIntoView();
      }

      async function setChat(chatId) {
        chat.value = await chats.getChat(chatId)
        messages.value = chat.value.messages;

        if (chat.value.prompt !== undefined)
          prompt.value = chat.value.prompt;
        else
          prompt.value = JSON.parse(JSON.stringify(prompts.prompts[0]));

        user.value = prompt.value.users[0];
        persona.value = prompt.value.users[1];

        if (chat.value.title === '') {
          await setChatName(chat.value.messages[0].content);
        }

        if (chat.value.messages.length == 1) {
          await generatePersonaMessage();
        }
      }

      watch(
        () => route.params.id,
        async newId => {
          await setChat(newId)
          messages.value = chat.value.messages
          // nextTick(() => {
          //   messages.value = chat.value.messages
          // })
        }
      )

      setChat(route.params.id)

      return {
        page,
        chat,
        messages,
        user,
        persona,
        sendMessage,
        input,
        inputText,
        chatId: route.params.id
      }
    }
  })
  </script>
  
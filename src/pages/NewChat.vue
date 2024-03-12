<template>
    <q-page class="align-items-center" style="display: flex; flex-direction: column;">
        <q-tabs
            v-model="selectedRoomId"
            narrow-indicator
            dense
            align="justify"
            active-color="white"
            no-caps
            mobile-arrows
            class="q-pa-lg"
        >
            <q-tab
                v-for="prompt of prompts.prompts"
                :key="prompt.roomId"
                :name="prompt.roomId">
                <q-avatar size="64px" color="white" class="q-mb-xs">
                    <img :src="prompt.avatar" class="q-pa-xs" />
                </q-avatar>
                {{ prompt.roomName }}
            </q-tab>
        </q-tabs>

        <q-expansion-item
            v-model="advancedShown"
            :icon="'img:'+selectedPrompt.avatar"
            label="Customize"
            style="flex-grow: 1;"
            class="q-pa-lg"
            >
            <q-card>
                <q-card-section class="row q-col-gutter-sm">
                    <q-input v-model="localValue.users[0].username" label="Your name" standout class="col-6" />
                    <q-input v-model="localValue.users[1].username" label="Persona name" standout class="col-6" />
                </q-card-section>
                <q-card-section class="">
                    <q-input autogrow v-model="localValue.persona" type="textarea" label="Persona Description" standout />
                </q-card-section>
            </q-card>
        </q-expansion-item>

        <div class="q-pb-xl">
            <message-input
            @sendMessage="sendMessage"
            v-model="message"
            ref="input"
            hint="Disclaimer: This chat bot uses personas for entertainment and informational purposes only. The
                chat bot's responses are not a reflection of any real person or organization's views or opinions, and should not
                be used as a substitute for professional advice. The accuracy and reliability of the chat bot's responses cannot
                be guaranteed. Users should exercise their own judgment and discretion when interacting with the chat bot and
                its personas. By using this chat bot, you acknowledge and agree to these terms." />
        </div>
    
    </q-page>
</template>
<script>
import { calculateNumberOfTokens } from '../utils/chat'
import { useModels } from 'src/stores/models'
import { useChats } from 'src/stores/chats'
import { usePrompts } from 'src/stores/prompts'
import { defineComponent, ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { createMessage } from '../utils/chat'
import { useRouter } from 'vue-router'
import MessageInput from 'src/components/MessageInput.vue'

export default defineComponent({
    name: 'NewChat',
    components: {
        MessageInput
    },
    setup() {
        const models = useModels()
        const chats = useChats()
        const prompts = usePrompts()
        const router = useRouter()


        const maxDocumentTokens = models.model.maxTokens - 2048
        const advancedShown = ref(false)
        const selectedPrompt = ref(prompts.prompts[0])
        const localValue = ref(JSON.parse(JSON.stringify(prompts.prompts[0])))
        const selectedRoomId = ref(prompts.prompts[0].roomId)

        // now watch for that roomid change
        watch(
            () => selectedRoomId.value,
            (newId) => {
                setPrompt(newId)
            }
        )

        const message = ref('')

        function sendMessage() {
            if (message.value.length === 0) {
                return
            }
            const chat = {
                id: uuidv4(),
                title: '',
                model: JSON.parse(JSON.stringify(models.model)), // we copy the model
                prompt: localValue.value,
                messages: []
            }
            // const chat = {
            //     roomId: selectedPrompt.value.roomId,
            //     message: message.value,
            //     localValue: localValue.value,
            //     model: models.model.id,
            //     temperature: 0.72,
            //     maxLength: 100,
            // }
            console.log(chats)
            const user = localValue.value.users[0];
            const userMessage = createMessage(user._id, user.username, message.value);
            chat.messages.push(userMessage);

            chats.addChat(chat)
            message.value = ''
            router.push({ name: 'chat', params: { id: chat.id } })
        }

        function setPrompt(roomId) {
            selectedPrompt.value = prompts.prompts.find((prompt) => prompt.roomId === roomId)
            // we pass the prompt to json and back to get a local copy
            localValue.value = JSON.parse(JSON.stringify(selectedPrompt.value))
        }

        return {
            maxDocumentTokens,
            advancedShown,
            localValue,
            selectedPrompt,
            selectedRoomId,
            message,
            sendMessage,
            setPrompt,
            models,
            prompt: ref(prompts.prompt),
            prompts,
            localSettings: {
                temperature: 0.72,
                maxLength: 100,
            },
            calculateNumberOfTokens: calculateNumberOfTokens
        }
    }
})
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
    transition: transform 0.3s, opacity 0.5s;
}
</style>
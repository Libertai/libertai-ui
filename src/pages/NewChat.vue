<template>
    <div class="column align-items-center q-pa-lg" style="min-height: calc(100vh - 50px)">
        <q-tabs
            v-model="selectedPrompt"
            narrow-indicator
            dense
            align="justify"
            active-color="white"
            no-caps
        >
            <q-tab
                v-for="prompt of prompts.prompts"
                :key="prompt.roomId"
                :name="prompt">
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
            class="col-grow"
            >
            <q-card>
                <q-card-section>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti
                commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste
                eveniet doloribus ullam aliquid.
                </q-card-section>
            </q-card>
        </q-expansion-item>

        <q-input filled bottom-slots autogrow v-model="message" label="Write your message here" autofocus class="q-pb-xl">

            <template v-slot:hint>
                Disclaimer: This chat bot uses personas for entertainment and informational purposes only. The
                chat bot's responses are not a reflection of any real person or organization's views or opinions, and should not
                be used as a substitute for professional advice. The accuracy and reliability of the chat bot's responses cannot
                be guaranteed. Users should exercise their own judgment and discretion when interacting with the chat bot and
                its personas. By using this chat bot, you acknowledge and agree to these terms.
            </template>

            <template v-slot:append>
                <q-btn round dense flat icon="send" @click="sendMessage" />
            </template>
        </q-input>
    
    </div>
</template>
<script>
import { calculateNumberOfTokens } from '../utils/chat'
import { useModels } from 'src/stores/models'
import { useChats } from 'src/stores/chats'
import { usePrompts } from 'src/stores/prompts'
import { defineComponent, ref } from 'vue'

export default defineComponent({
    name: 'NewChat',
    setup() {
        const models = useModels()
        const chats = useChats()
        const prompts = usePrompts()


        const maxDocumentTokens = models.model.maxTokens - 2048
        const advancedShown = ref(false)
        const localValue = ref({})
        const selectedPrompt = ref(prompts.prompts[0])
        const message = ref('')

        function sendMessage() {
            if (message.value.length === 0) {
                return
            }
            const chat = {
                title: title,
                model: model,
                prompt: selectedPrompt,
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
            chats.addChat(chat)
            message.value = ''
        }

        return {
            maxDocumentTokens,
            advancedShown,
            localValue,
            selectedPrompt,
            message,
            sendMessage,
            models: models.models,
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
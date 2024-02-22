<template>
    <div class="d-flex flex-column align-items-center">
        <div class="q-gutter-x-sm">
            <q-btn round color="white" v-for="prompt of prompts.prompts">
                <q-avatar size="28px">
                    <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" />
                </q-avatar>
            </q-btn>
        </div>
        <p class="text-center">Welcome! Please type your question to start a new discussion with your assistant.</p>
        <p class="text-center">You can also customize the assistant prompt and used model by using advanced settings.</p>
        <span style="cursor: pointer;" @click="advancedShown=!advancedShown">
            Customize
        </span>
        <Transition name="scale-in">
            <div class="card bg-dark text-white" v-if="advancedShown">
                <div class="card-body">
                    <form class="row g-3" v-if="localValue !== undefined">
                        <div class="col-12">
                            <label for="model" class="form-label">Model</label>
                            <select v-model="model" id="model"  class="form-control">
                                <option v-for="(vmodel, index) in models" :value="index" :key="vmodel.name">{{ vmodel.name }}</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="user_name" class="form-label">Your name</label>
                            <input type="username" class="form-control" id="user_name" v-model="localValue.users[0].username">
                        </div>
                        <div class="col-md-6">
                            <label for="persona_name" class="form-label">Persona Name</label>
                            <input type="username" class="form-control" id="persona_name" v-model="localValue.users[1].username">
                        </div>
                        <div class="col-12">
                            <label for="persona" class="form-label">Persona</label>
                            <textarea class="form-control" id="persona" rows="5" v-model="localValue.persona"></textarea>
                        </div>

                        <!-- Now we add an upload box for a PDF file upload that would be read as additional context
                        <div class="col-12">
                            <label for="pdf" class="form-label">Upload PDF to context</label>
                            <input type="file" class="form-control" id="pdf" v-on:change="handleFileUpload">
                        </div> -->
                        <div v-if="loading" class="loading col-12">Loading...</div>
                        <div v-else-if="extractedText != ''" class="col-12">
                            <span v-if="calculateNumberOfTokens(extractedText) < maxDocumentTokens">PDF with approximately {{Math.ceil(calculateNumberOfTokens(extractedText))}} tokens.</span>
                            <span v-else class="text-red">PDF with more than {{maxDocumentTokens}} tokens.</span>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>


        <p class="disclaimer text-center">Disclaimer: This chat bot uses personas for entertainment and informational purposes only. The
            chat bot's responses are not a reflection of any real person or organization's views or opinions, and should not
            be used as a substitute for professional advice. The accuracy and reliability of the chat bot's responses cannot
            be guaranteed. Users should exercise their own judgment and discretion when interacting with the chat bot and
            its personas. By using this chat bot, you acknowledge and agree to these terms.</p>
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

        return {
            maxDocumentTokens,
            advancedShown,
            localValue,
            models: models.models,
            prompt: ref(prompts.prompt),
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
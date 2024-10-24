<template>
  <ltai-dialog v-if="props.chat !== null" title="Chat settings" @save="saveSettings">
    <q-card-section horizontal>
      <q-card-section class="tw-my-auto">
        <q-avatar>
          <img :src="getPersonaAvatarUrl(avatar.ipfs_hash)" alt="avatar" />
        </q-avatar>
      </q-card-section>
      <q-card-section>
        <span>Your name</span>
        <q-input v-model="username" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
      </q-card-section>
    </q-card-section>

    <q-card-section>
      <div class="tw-gap-2 tw-flex tw-flex-col tw-text-center">
        <p>Persona</p>
        <persona-dropdown
          :selected-persona="selectedPersona"
          @select-persona="(persona: UIPersona) => (selectedPersona = persona)"
        />
      </div>
    </q-card-section>

    <q-card-section>
      <div class="tw-gap-2 tw-flex tw-flex-col tw-text-center">
        <p>Model</p>
        <model-selector :selected-model="selectedModel" @select-model="(model: UIModel) => (selectedModel = model)" />
      </div>
    </q-card-section>

    <q-card-section>
      <div class="tw-gap-2 tw-flex tw-flex-col tw-text-center">
        <p>Knowledge bases</p>
        <knowledge-bases-selector v-model="selectedKnowledgeBases" />
      </div>
    </q-card-section>
  </ltai-dialog>
</template>

<script lang="ts" setup>
import LtaiDialog from 'components/libertai/LtaiDialog.vue';
import KnowledgeBasesSelector from 'components/select/KnowledgeBasesSelector.vue';
import ModelSelector from 'components/select/ModelSelector.vue';
import PersonaDropdown from 'components/select/PersonaSelector.vue';
import { Chat } from 'src/types/chats';
import { UIPersona } from 'src/types/personas';
import { UIModel } from 'src/utils/models';
import { getPersonaAvatarUrl } from 'src/utils/personas';
import { useModelsStore } from 'stores/models';
import { usePersonasStore } from 'stores/personas';
import { useSettingsStore } from 'stores/settings';
import { ref, watch } from 'vue';

const { avatar } = useSettingsStore();
const personasStore = usePersonasStore();
const modelsStore = useModelsStore();

const props = defineProps<{ chat: Chat | null }>();
const emit = defineEmits<{ saveChat: [value: Chat] }>();

// Form values
const username = ref('');
const selectedPersona = ref<UIPersona>(personasStore.personas[0]);
const selectedModel = ref<UIModel>(modelsStore.models[0]);
const selectedKnowledgeBases = ref<string[]>([]);

watch(
  () => props.chat,
  (newChat: Chat | null) => {
    if (newChat === null) {
      return;
    }

    username.value = newChat.username;
    selectedPersona.value = JSON.parse(JSON.stringify(newChat.persona));
    selectedKnowledgeBases.value = JSON.parse(JSON.stringify(newChat.knowledgeBases));

    const model = modelsStore.models.find((m) => m.id === newChat.modelId);
    if (model !== undefined) {
      selectedModel.value = model;
    }
  },
);

const saveSettings = () => {
  emit('saveChat', {
    ...props.chat!,
    username: username.value,
    modelId: selectedModel.value.id,
    persona: selectedPersona.value,
    knowledgeBases: selectedKnowledgeBases.value,
  });
};
</script>

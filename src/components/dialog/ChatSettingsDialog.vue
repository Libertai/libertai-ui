<template>
  <q-dialog v-if="props.chat !== null" class="q-pa-lg text-light" style="flex-grow: 1">
    <q-card class="q-pa-md">
      <q-card-actions :class="`flex flex-left text-semibold ${$q.dark.mode ? '' : 'text-purple700'}`">
        Chat settings
        <q-space />
        <q-btn
          v-close-popup
          :icon="`img:icons/svg/close${$q.dark.mode ? '_lighten' : ''}.svg`"
          flat
          size="sm"
          unelevated
        />
      </q-card-actions>

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

      <q-card-section class="text-primary tw-mt-4" horizontal>
        <q-btn v-close-popup class="q-px-xl tw-py-1" label="Close" rounded />
        <q-space />
        <q-btn
          v-close-popup
          class="bg-primary q-px-xl tw-py-1"
          label="Confirm"
          rounded
          text-color="white"
          @click="saveSettings"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useSettingsStore } from 'stores/settings';
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { getPersonaAvatarUrl } from 'src/utils/personas';
import { Chat } from 'src/types/chats';
import { UIModel } from 'src/utils/models';
import ModelSelector from 'components/select/ModelSelector.vue';
import { useModelsStore } from 'stores/models';
import { UIPersona } from 'src/types/personas';
import PersonaDropdown from 'components/select/PersonaSelector.vue';
import { usePersonasStore } from 'stores/personas';

const { avatar } = useSettingsStore();
const personasStore = usePersonasStore();
const modelsStore = useModelsStore();
const $q = useQuasar();

const props = defineProps<{ chat: Chat | null }>();
const emit = defineEmits<{ saveChat: [value: Chat] }>();

// Form values
const username = ref('');
const selectedPersona = ref<UIPersona>(personasStore.personas[0]);
const selectedModel = ref<UIModel>(modelsStore.models[0]);

watch(
  () => props.chat,
  (newChat: Chat | null) => {
    if (newChat === null) {
      return;
    }

    username.value = newChat.username;
    selectedPersona.value = JSON.parse(JSON.stringify(newChat.persona));

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
  });
};
</script>

<template>
  <q-dialog class="q-pa-lg text-light" label="Customize" style="flex-grow: 1">
    <q-card class="q-pa-md">
      <q-card-actions :class="`flex flex-left text-semibold ${$q.dark.mode ? '' : 'text-purple700'}`">
        {{ title }}
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
        <q-card-section>
          <q-avatar>
            <img :src="basePersona?.avatarUrl" alt="avatar" />
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <span>Persona name</span>
          <q-input v-model="name" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
        </q-card-section>
      </q-card-section>

      <q-card-section>
        <span>Your name</span>
        <q-input v-model="username" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
      </q-card-section>
      <q-card-section>
        <span>Persona Description</span>
        <q-input
          v-model="description"
          autogrow
          bg-color="secondary"
          input-class="text-light"
          outlined
          type="textarea"
        />
      </q-card-section>
      <q-card-section class="text-primary" horizontal>
        <q-btn v-close-popup class="q-px-xl q-py-xs" label="Close" rounded />
        <q-space />
        <q-btn
          v-close-popup
          class="bg-primary q-px-xl q-py-xs"
          label="Confirm"
          rounded
          text-color="white"
          @click="emit('savePersona', { ...basePersona, name, description })"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useSettingsStore } from 'src/stores/settings';
import { ref, toRef, watch } from 'vue';

const settingsStore = useSettingsStore();

const props = defineProps({
  title: {
    type: String,
    default: 'Customize persona',
  },
  basePersona: {
    type: Object,
    required: false,
  },
});
const emit = defineEmits(['savePersona']);

// Form values
const username = ref(settingsStore.username);
const name = ref(props.basePersona?.name ?? '');
const description = ref(props.basePersona?.description ?? '');

// Update the name input when the store changes  (might be updated by Aleph settings fetching)
watch(toRef(settingsStore, 'username'), () => {
  username.value = settingsStore.username;
});

watch(
  () => props.basePersona?.name,
  () => (name.value = props.basePersona?.name ?? ''),
);
watch(
  () => props.basePersona?.description,
  () => (description.value = props.basePersona?.description ?? ''),
);
</script>

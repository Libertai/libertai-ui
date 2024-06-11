<template>
  <q-dialog class="q-pa-lg text-light" label="Customize" style="flex-grow: 1">
    <q-card class="q-pa-md">
      <q-card-actions :class="`flex flex-left text-semibold ${$q.dark.mode ? '' : 'text-purple700'}`">
        Customize persona
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
            <img :src="personasStore.persona.avatarUrl" alt="avatar" />
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <label>Persona name</label>
          <q-input v-model="personaName" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
        </q-card-section>
      </q-card-section>

      <q-card-section>
        <label>Your name</label>
        <q-input v-model="username" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
      </q-card-section>
      <q-card-section>
        <label>Persona Description</label>
        <q-input
          v-model="personaDescription"
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
          @click="updatePersona"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { usePersonasStore } from 'src/stores/personas-store';
import { useSettingsStore } from 'src/stores/settings';
import { ref, toRef, watch } from 'vue';

const personasStore = usePersonasStore();
const settingsStore = useSettingsStore();

// Form values
const username = ref(settingsStore.username);
const personaName = ref(personasStore.persona.name);
const personaDescription = ref(personasStore.persona.description);

// Update the name input when the store changes  (might be updated by Aleph settings fetching)
watch(toRef(settingsStore, 'username'), () => {
  username.value = settingsStore.username;
});

function updatePersona() {
  personasStore.persona.name = personaName;
  personasStore.persona.description = personaDescription;
  settingsStore.update({ username: username.value });
}
</script>

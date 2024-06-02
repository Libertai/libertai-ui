<template>
  <q-dialog class="q-pa-lg text-light" label="Customize" style="flex-grow: 1">
    <q-card class="q-pa-md">
      <q-card-actions :class="`flex flex-left text-semibold ${$q.dark.mode ? '' : 'text-purple700'}`">
        Customize persona
        <q-space />
        <q-btn
          v-close-popup
          flat
          :icon="`img:icons/svg/close${$q.dark.mode ? '_lighten' : ''}.svg`"
          size="sm"
          unelevated
        />
      </q-card-actions>

      <q-card-section horizontal>
        <q-card-section>
          <q-avatar>
            <img :src="personasStore.persona.avatarUrl" />
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <label>Persona name</label>
          <q-input v-model="personasStore.persona.name" bg-color="secondary" input-class="text-light q-px-sm" outlined>
          </q-input>
        </q-card-section>
      </q-card-section>

      <q-card-section>
        <label>Your name</label>
        <q-input v-model="username" bg-color="secondary" input-class="text-light q-px-sm" outlined> </q-input>
      </q-card-section>
      <q-card-section>
        <label>Persona Description</label>
        <q-input
          v-model="personasStore.persona.description"
          autogrow
          bg-color="secondary"
          input-class="text-light"
          outlined
          type="textarea"
        />
      </q-card-section>
      <q-card-section align="right" class="text-primary" horizontal>
        <q-btn v-close-popup class="q-px-xl q-py-xs" label="Close" rounded />
        <q-space />
        <q-btn
          v-close-popup
          class="bg-primary q-px-xl q-py-xs"
          label="Confirm"
          rounded
          text-color="white"
          @click="updatePersona()"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { usePersonasStore } from 'src/stores/personas-store';
import { useSettingsStore } from 'src/stores/settings';
import { storeToRefs } from 'pinia';

const personasStore = usePersonasStore();
const settings = useSettingsStore();
const { username } = storeToRefs(settings);

function updatePersona() {
  // on update persona event
}
</script>

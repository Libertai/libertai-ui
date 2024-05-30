<template>
  <q-dialog class="q-pa-lg" label="Customize" style="flex-grow: 1">
    <q-card class="q-pa-md">
      <q-card-actions class="flex flex-left text-purple700 text-semibold">
        Customize persona
        <q-space />
        <q-btn v-close-popup flat icon="img:icons/svg/close.svg" size="sm" unelevated />
      </q-card-actions>

      <q-card-section horizontal>
        <q-card-section>
          <q-avatar>
            <img :src="persona.avatarUrl" />
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <label class="text-light">Persona name</label>
          <q-input v-model="persona.name" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
        </q-card-section>
      </q-card-section>

      <q-card-section>
        <label class="text-light">Your name</label>
        <q-input v-model="usernameInputRef" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
      </q-card-section>
      <q-card-section>
        <label class="text-light">Persona Description</label>
        <q-input
          v-model="persona.description"
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

<script>
import { usePersonasStore } from 'src/stores/personas-store';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'PersonaDialog',
  setup() {
    const personasStore = usePersonasStore();
    const persona = personasStore.persona;
    const usernameInputRef = ref('user');

    function updatePersona() {
      personasStore.setPersona(persona);
    }

    return {
      usernameInputRef,
      persona,
      updatePersona,
    };
  },
});
</script>

<template>
  <q-dialog label="Customize" style="flex-grow: 1" class="q-pa-lg">
    <q-card class="q-pa-md">
      <q-card-actions class="flex flex-left text-purple700 text-semibold">
        Customize persona
        <q-space />
        <q-btn icon="img:icons/svg/close.svg" size="sm" flat unelevated v-close-popup />
      </q-card-actions>

      <q-card-section horizontal>
        <q-card-section>
          <q-avatar>
            <img :src="persona.avatarUrl" />
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <label class="text-light">Persona name</label>
          <q-input outlined v-model="persona.name" input-class="text-light q-px-sm" bg-color="secondary"> </q-input>
        </q-card-section>
      </q-card-section>

      <q-card-section>
        <label class="text-light">Your name</label>
        <q-input outlined v-model="usernameInputRef" input-class="text-light q-px-sm" bg-color="secondary"> </q-input>
      </q-card-section>
      <q-card-section>
        <label class="text-light">Persona Description</label>
        <q-input
          autogrow
          v-model="persona.description"
          type="textarea"
          outlined
          input-class="text-light"
          bg-color="secondary"
        />
      </q-card-section>
      <q-card-section align="right" class="text-primary" horizontal>
        <q-btn rounded label="Close" v-close-popup class="q-px-xl q-py-xs" />
        <q-space />
        <q-btn
          rounded
          label="Confirm"
          class="bg-primary q-px-xl q-py-xs"
          text-color="white"
          v-close-popup
          @click="updatePersona()"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { usePersonasStore } from 'src/stores/personas-store';
import { defineComponent, ref } from 'vue';
import { storeToRefs } from 'pinia';

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

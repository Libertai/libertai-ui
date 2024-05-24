<template>
  <q-dialog
    label="Customize"
    style="flex-grow: 1"
    class="q-pa-lg"
    >

    <q-card class="q-pa-md">
      <q-card-actions class="flex flex-left text-purple700 text-semibold">
        Customize persona
        <q-space />
        <q-btn icon="img:icons/svg/close.svg" size="sm" flat unelevated v-close-popup />
      </q-card-actions>

      <q-card-section horizontal>
        <q-card-section>
        <q-avatar>
          <img :src="personasStore.persona.avatarUrl">
        </q-avatar>
        </q-card-section>
        <q-card-section>
        <label class="text-light">Persona name</label>
        <q-input
          outlined
          v-model="personasStore.persona.name"
          input-class="text-light q-px-sm"
          bg-color="secondary"
                 >
        </q-input>
        </q-card-section>
      </q-card-section>

      <q-card-section>
        <label class="text-light">Your name</label>
        <q-input
          outlined
          v-model="usernameInputRef"
          input-class="text-light q-px-sm"
          bg-color="secondary"
          >
        </q-input>
      </q-card-section>
      <q-card-section>
        <label class="text-light">Persona Description</label>
        <q-input
          autogrow
          v-model="personasStore.persona.description"
          type="textarea"
          outlined
          input-class="text-light"
          bg-color="secondary"
          />
      </q-card-section>
      <q-card-section align="right" class="text-primary" horizontal>
        <q-btn rounded label="Close" v-close-popup class="q-px-xl q-py-xs" />
        <q-space />
        <q-btn rounded label="Confirm" class="bg-primary q-px-xl q-py-xs" text-color="white" v-close-popup />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useModelsStore } from 'src/stores/models-store';
import { usePersonasStore } from 'src/stores/personas-store';
import { defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PersonaDialog',
  setup(props) {
    const router = useRouter();
    const modelsStore = useModelsStore();
    // TODO: We probably don't need to use a store for this
    const personasStore = usePersonasStore();
    const selectedPersonaRef = ref(personasStore.persona);
    const usernameInputRef = ref('user');
    console.log("Storage", personasStore)
    return {
      selectedPersonaRef,
      personasStore,
      usernameInputRef
    };
  }
});
</script>

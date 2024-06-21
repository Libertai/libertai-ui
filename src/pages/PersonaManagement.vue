<template>
  <section class="max-sm:tw-mx-4 md:tw-mx-10 tw-my-5">
    <h4 class="text-h4 text-semibold tw-mb-5">Persona Management</h4>
    <p>Click on a persona to edit</p>
    <div class="tw-my-4 tw-flex md:tw-justify-end">
      <q-btn
        icon="img:icons/svg/add.svg"
        label="Create persona"
        no-caps
        rounded
        unelevated
        @click="createPersona = true"
      />
      <persona-dialog
        v-model="createPersona"
        v-model:base-persona="basePersonaCreate"
        title="Create persona"
        @save-persona="
          (persona: Persona) => {
            personasStore.personas.push({ ...persona, allowEdit: true, hidden: false, id: uuidv4() });
          }
        "
      />
      <persona-dialog
        v-model="editPersona"
        v-model:base-persona="personasStore.persona"
        @save-persona="
          (persona: Persona) => {
            personasStore.persona = persona;

            personasStore.personas = personasStore.personas.map((userPersona) => {
              if (userPersona.id === persona.id) {
                return persona;
              }
              return userPersona;
            });
          }
        "
      />

      <q-btn disabled icon="img:icons/svg/import.svg" label="Import persona" no-caps rounded unelevated>
        <q-tooltip>Soon for token holders</q-tooltip>
      </q-btn>
    </div>

    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-y-4 tw-gap-x-4">
      <q-card
        v-for="persona of personasStore.sortedPersonas"
        :key="persona.id"
        :class="`persona-card ${persona.hidden ? 'bg-purple-50' : ' tw-bg-white'}`"
      >
        <q-avatar class="tw-w-24 tw-h-24 tw-mx-auto">
          <img :src="getPersonaAvatarUrl(persona.avatar.ipfs_hash)" alt="avatar" />
        </q-avatar>
        <q-card-section class="text-bold">{{ persona.label }}</q-card-section>

        <p class="persona-description">
          {{ persona.description }}
        </p>

        <div class="tw-grid tw-grid-cols-5 tw-gap-x-4 tw-w-40 tw-mx-auto">
          <q-btn unelevated @click="startChatWithPersona(persona)">
            <q-icon size="xs">
              <img alt="new chat" src="/icons/svg/chat.svg" />
            </q-icon>
            <q-tooltip>New chat</q-tooltip>
          </q-btn>

          <q-btn :disabled="!persona.allowEdit" unelevated @click="startEditingPersona(persona)">
            <q-icon size="xs">
              <img :src="`icons/svg/settings.svg`" alt="settings" />
            </q-icon>
            <q-tooltip>Edit persona</q-tooltip>
          </q-btn>

          <q-btn disabled unelevated>
            <q-icon size="xs">
              <img alt="export" src="/icons/svg/download.svg" />
            </q-icon>
            <q-tooltip>Export (soon for token holders)</q-tooltip>
          </q-btn>

          <q-btn v-if="persona.allowEdit" unelevated @click="deletePersona(persona)">
            <q-icon size="xs">
              <img alt="delete" src="/icons/svg/delete.svg" />
            </q-icon>
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
          <q-btn v-else unelevated @click="reversePersonaVisibility(persona)">
            <q-icon size="xs">
              <img v-if="persona.hidden" alt="hide" src="/icons/svg/show.svg" />
              <img v-else alt="hide" src="/icons/svg/hide.svg" />
            </q-icon>
            <q-tooltip>Hide</q-tooltip>
          </q-btn>

          <q-btn
            unelevated
            @click="
              () => {
                basePersonaCreate = JSON.parse(JSON.stringify(persona));
                createPersona = true;
              }
            "
          >
            <q-icon size="xs">
              <img alt="duplicate" src="/icons/svg/duplicate.svg" />
            </q-icon>
            <q-tooltip>Duplicate</q-tooltip>
          </q-btn>
        </div>
      </q-card>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { usePersonasStore } from 'stores/personas-store';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { getPersonaAvatarUrl, Persona } from 'src/utils/personas';
import PersonaDialog from 'src/components/PersonaDialog.vue';

const personasStore = usePersonasStore();
const router = useRouter();

const createPersona = ref(false);
const editPersona = ref(false);
const basePersonaCreate = ref<Persona | undefined>(undefined);

const startChatWithPersona = (persona: Persona) => {
  personasStore.persona = persona;
  router.push('/new');
};

const startEditingPersona = (persona: Persona) => {
  personasStore.persona = persona;
  editPersona.value = true;
};

const deletePersona = (persona: Persona) => {
  personasStore.personas = personasStore.personas.filter((userPersona) => userPersona.id !== persona.id);
  if (personasStore.persona.id === persona.id) {
    personasStore.persona = personasStore.personas.find((userPersona) => !userPersona.hidden)!;
  }
};

const reversePersonaVisibility = (persona: Persona) => {
  personasStore.personas = personasStore.personas.map((userPersona) => {
    if (userPersona.id === persona.id) {
      return { ...userPersona, hidden: !userPersona.hidden };
    }
    return userPersona;
  });
};
</script>

<style lang="postcss" scoped>
.persona-card {
  border: 1px solid rgba(0, 0, 0, 0.1);

  @apply tw-shadow-none tw-rounded-2xl tw-justify-center tw-text-center tw-p-6;
}

.persona-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @apply tw-overflow-hidden tw-mx-auto tw-h-11 tw-mb-4;
}
</style>

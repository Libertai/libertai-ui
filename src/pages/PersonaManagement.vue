<template>
  <section class="max-sm:tw-mx-4 md:tw-mx-10">
    <h4 class="text-h4 text-semibold tw-my-5">Persona Management</h4>
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
      <persona-dialog v-model="createPersona" title="Create persona" />
      <persona-dialog
        v-model="editPersona"
        :description="personasStore.persona.description"
        :name="personasStore.persona.name"
      />

      <q-btn disabled="" icon="img:icons/svg/import.svg" label="Import persona" no-caps rounded unelevated />
    </div>

    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-y-4 tw-gap-x-4">
      <q-card v-for="persona of personas" :key="persona.id" class="persona-card bg-purple-50">
        <q-avatar class="tw-w-24 tw-h-24 tw-mx-auto">
          <img :src="persona.avatarUrl" alt="avatar" />
        </q-avatar>
        <q-card-section class="text-bold">{{ persona.name }}</q-card-section>

        <p class="persona-description">
          {{ persona.description }}
        </p>

        <div class="tw-grid tw-grid-cols-3 tw-gap-x-4 tw-w-40 tw-mx-auto">
          <q-btn unelevated @click="startChatWithPersona(persona)">
            <q-icon size="sm">
              <img alt="new chat" src="/icons/svg/chat.svg" />
            </q-icon>
          </q-btn>

          <q-btn unelevated @click="startEditingPersona(persona)">
            <q-icon size="sm">
              <img :src="`icons/svg/settings.svg`" alt="settings" />
            </q-icon>
          </q-btn>

          <q-btn disabled="" unelevated>
            <q-icon size="sm">
              <img alt="export" src="/icons/svg/download.svg" />
            </q-icon>
          </q-btn>
        </div>
      </q-card>
    </div>
  </section>
</template>

<script setup>
import { usePersonasStore } from 'stores/personas-store';
import PersonaDialog from 'components/PersonaDialog.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const personas = usePersonasStore().personas;
const personasStore = usePersonasStore();
const router = useRouter();

const createPersona = ref(false);
const editPersona = ref(false);

const startChatWithPersona = (persona) => {
  personasStore.persona = persona;
  router.push('/new');
};

const startEditingPersona = (persona) => {
  personasStore.persona = persona;
  editPersona.value = true;
};
</script>

<style lang="postcss" scoped>
.persona-card {
  border: 1px solid rgba(0, 0, 0, 0.1);

  @apply tw-shadow-none tw-bg-white tw-rounded-2xl tw-justify-center tw-text-center tw-p-6;
}

.persona-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @apply tw-overflow-hidden tw-mx-auto tw-h-11 tw-mb-4;
}
</style>

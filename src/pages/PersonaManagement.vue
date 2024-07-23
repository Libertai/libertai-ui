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
        :base-persona="basePersonaCreate"
        title="Create persona"
        @save-persona="
          (persona: BasePersonaEdition) => {
            personasStore.personas.push({ ...persona, allowEdit: true, hidden: false, id: uuidv4() });
          }
        "
      />
      <persona-dialog
        v-model="editPersona"
        :base-persona="selectedPersona"
        @save-persona="
          (persona: BasePersonaEdition) => {
            const fullPersona: UIPersona = { ...selectedPersona!, ...persona };

            personasStore.personas = personasStore.personas.map((userPersona) => {
              if (userPersona.id === fullPersona.id) {
                return fullPersona;
              }
              return userPersona;
            });
          }
        "
      />

      <input ref="importPersonaUpload" accept="*.json" hidden type="file" @change="importPersona" />
      <q-btn
        :disabled="accountStore.ltaiBalance < 100"
        icon="img:icons/svg/import.svg"
        label="Import persona"
        no-caps
        rounded
        unelevated
        @click="($refs['importPersonaUpload'] as any).click()"
      >
        <q-tooltip v-if="tokenGatingMessage !== undefined">{{ tokenGatingMessage }}</q-tooltip>
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
        <q-card-section class="text-bold">{{ persona.name }}</q-card-section>

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

          <q-btn :disabled="accountStore.ltaiBalance < 100" unelevated @click="exportPersona(persona)">
            <q-icon size="xs">
              <img alt="export" src="/icons/svg/download.svg" />
            </q-icon>
            <q-tooltip v-if="tokenGatingMessage === undefined">Export</q-tooltip>
            <q-tooltip v-else>{{ `Export (${tokenGatingMessage})` }}</q-tooltip>
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

          <q-btn unelevated @click="duplicatePersona(persona)">
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
import { usePersonasStore } from 'stores/personas';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { getPersonaAvatarUrl } from 'src/utils/personas';
import PersonaDialog from 'src/components/PersonaDialog.vue';
import { useAccountStore } from 'stores/account';
import { exportFile } from 'quasar';
import { getTokenGatingMessage } from 'src/utils/messages';
import { z } from 'zod';
import { BasePersonaEdition, UIPersona } from 'src/types/personas';

const personasStore = usePersonasStore();
const accountStore = useAccountStore();
const router = useRouter();

const createPersona = ref(false);
const editPersona = ref(false);
const selectedPersona = ref<UIPersona | undefined>(undefined);
const basePersonaCreate = ref<BasePersonaEdition | undefined>(undefined);

const tokenGatingMessage = computed(() => getTokenGatingMessage(accountStore.ltaiBalance, 100));

const startChatWithPersona = (persona: UIPersona) => {
  router.push(`/new?persona=${persona.id}`);
};

const startEditingPersona = (persona: UIPersona) => {
  selectedPersona.value = persona;
  editPersona.value = true;
};

const duplicatePersona = (persona: UIPersona) => {
  basePersonaCreate.value = JSON.parse(JSON.stringify(persona));
  createPersona.value = true;
};

const deletePersona = (persona: UIPersona) => {
  personasStore.personas = personasStore.personas.filter((userPersona) => userPersona.id !== persona.id);
};

const reversePersonaVisibility = (persona: UIPersona) => {
  personasStore.personas = personasStore.personas.map((userPersona) => {
    if (userPersona.id === persona.id) {
      return { ...userPersona, hidden: !userPersona.hidden };
    }
    return userPersona;
  });
};

const personaExportImportSchema = z.object({
  data: z.object({
    description: z.string(),
    name: z.string(),
    role: z.string(),
    avatar: z.object({
      item_hash: z.string(),
      ipfs_hash: z.string(),
    }),
  }),
});
type PersonaExportImportSchema = z.infer<typeof personaExportImportSchema>;

const exportPersona = (persona: UIPersona) => {
  // Avoid breaking changes on this format as much as possible to avoid breaking import of already exported files
  const jsonData: PersonaExportImportSchema = {
    data: {
      description: persona.description,
      name: persona.name,
      role: persona.role,
      avatar: persona.avatar,
    },
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: 'application/json',
  });

  exportFile(`libertai_persona_${persona.name}.json`, blob);
};

const importPersona = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = (target.files as FileList)[0];

  const reader = new FileReader();

  reader.onload = (e) => {
    const result = JSON.parse(e.target!.result as string);
    const parsedFile = personaExportImportSchema.safeParse(result);

    if (!parsedFile.success) {
      console.error(parsedFile.error);
      return;
    }

    basePersonaCreate.value = parsedFile.data.data;
    createPersona.value = true;
  };
  reader.readAsText(file);
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

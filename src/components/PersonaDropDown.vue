<template>
  <q-btn-dropdown
    :icon="'img:' + getPersonaAvatarUrl(personasStore.persona.avatar.ipfs_hash)"
    :label="personasStore.persona.name"
    class="no-shadow rounded-img personas-dropdown q-py-sm icon-md"
    dropdown-icon="img:icons/svg/chevron-down.svg"
    no-caps
    rounded
    text-color="primary"
    unelevated
  >
    <q-list>
      <q-item
        v-for="persona of personasStore.shownPersonas"
        :key="persona.id"
        v-close-popup
        :name="persona.id"
        clickable
        @click="setPersona(persona.id)"
      >
        <q-avatar class="q-mr-md" size="32px">
          <img :src="getPersonaAvatarUrl(persona.avatar.ipfs_hash)" alt="avatar" />
        </q-avatar>
        <q-item-section>
          <q-item-label>
            {{ persona.name }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts" setup>
import { usePersonasStore } from 'stores/personas';
import { getPersonaAvatarUrl } from 'src/utils/personas';

const personasStore = usePersonasStore();

function setPersona(id: string) {
  personasStore.persona = personasStore.personas.find((persona) => persona.id === id)!;
}
</script>

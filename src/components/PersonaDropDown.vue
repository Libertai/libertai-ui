<template>
  <q-btn-dropdown
    :icon="'img:' + personasStore.persona.avatarUrl"
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
        v-for="persona of personasStore.personas"
        :key="persona.id"
        v-close-popup
        :name="persona.id"
        clickable
        @click="setPersona(persona.id)"
      >
        <q-avatar class="q-mr-md" size="32px">
          <img :src="persona.avatarUrl" alt="avatar" />
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

<script setup>
import { usePersonasStore } from 'stores/personas-store';

const personasStore = usePersonasStore();

function setPersona(id) {
  personasStore.persona = personasStore.personas.find((persona) => persona.id === id);
}
</script>

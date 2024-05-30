<template>
  <q-btn-dropdown
    no-caps
    unelevated
    rounded
    :icon="'img:' + personasStore.persona.avatarUrl"
    dropdown-icon="img:icons/svg/chevron-down.svg"
    class="no-shadow rounded-img personas-dropdown q-py-sm"
    text-color="primary"
    :label="personasStore.persona.name"
  >
    <q-list>
      <q-item
        clickable
        v-close-popup
        v-for="persona of personasStore.personas"
        :key="persona.id"
        :name="persona.id"
        @click="setPersona(persona.id)"
      >
        <q-avatar size="32px" class="q-mr-md">
          <img :src="persona.avatarUrl" />
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

<script>
import { defineComponent } from 'vue';
import { usePersonasStore } from 'src/stores/personas-store';

export default defineComponent({
  name: 'PersonaDropDown',
  setup() {
    const personasStore = usePersonasStore();

    function setPersona(id) {
      personasStore.setPersona(personasStore.personas.find((persona) => persona.id === id));
    }

    return {
      personasStore,
      setPersona,
    };
  },
});
</script>

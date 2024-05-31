<template>
  <q-btn-dropdown
    :icon="'img:' + personasStore.persona.avatarUrl"
    :label="personasStore.persona.name"
    class="no-shadow rounded-img personas-dropdown q-py-sm"
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
      personasStore.persona = personasStore.personas.find((persona) => persona.id === id);
    }

    return {
      personasStore,
      setPersona,
    };
  },
});
</script>

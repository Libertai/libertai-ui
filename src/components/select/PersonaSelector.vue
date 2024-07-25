<template>
  <q-btn-dropdown
    :icon="'img:' + getPersonaAvatarUrl(selectedPersona.avatar.ipfs_hash)"
    :label="selectedPersona.name"
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
        @click="emit('selectPersona', persona)"
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
import { PropType } from 'vue';
import { UIPersona } from 'src/types/personas';

const personasStore = usePersonasStore();

const { selectedPersona } = defineProps({
  selectedPersona: {
    type: Object as PropType<UIPersona>,
    required: true,
  },
});

const emit = defineEmits<{ selectPersona: [value: UIPersona] }>();
</script>

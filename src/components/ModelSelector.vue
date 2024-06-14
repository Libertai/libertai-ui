<template>
  <q-btn-dropdown
    :label="modelsStore.selectedModel.name.substring(0, 12) + '..'"
    class="text-semibold icon-md border-primary-highlight"
    color="primary"
    dropdown-icon="img:icons/svg/chevron-down_lighten.svg"
    no-caps
    rounded
    size="md"
    unelevated
  >
    <q-list>
      <q-item
        v-for="model in modelsStore.models"
        :key="model.id"
        v-close-popup
        clickable
        @click="modelsStore.setModel(model)"
      >
        <q-item-section>
          <q-item-label>
            {{ model.name }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts" setup>
import { useModelsStore } from 'stores/models-store';

const modelsStore = useModelsStore();
</script>

<template>
  <q-btn-dropdown
    :label="modelsStore.selectedModel.name.substring(0, 12) + '..'"
    class="text-semibold icon-md border-primary-highlight"
    dropdown-icon="img:icons/svg/chevron-down.svg"
    size="md"
    color="primary"
    no-caps
    rounded
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
  <!--
  <q-btn-dropdown
    :icon="$q.screen.gt.sm ? 'img:icons/svg/engine.svg' : ''"
    :label="modelsStore.selectedModel.name.substring(0, 12) + '..'"
    class="border-primary-highlight"
    color="primary"
    no-caps
    rounded
    text-color="white"
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
  -->
</template>

<script setup>
import { useModelsStore } from '../stores/models-store';
const modelsStore = useModelsStore();
</script>

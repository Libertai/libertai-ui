<template>
  <q-select
    v-model="selectedKnowledgeBases"
    :disable="!knowledgeStore.isLoaded"
    :option-label="
      (option: KnowledgeBase | string) =>
        typeof option === 'string'
          ? (knowledgeStore.knowledgeBases.find((kb) => kb.id === option)?.name ?? 'Not found')
          : option.name
    "
    :option-value="(option: KnowledgeBase | string) => (typeof option === 'string' ? option : option.id)"
    :options="knowledgeStore.knowledgeBases"
    emit-value
    filled
    multiple
    use-chips
  />
</template>

<script lang="ts" setup>
import { useKnowledgeStore } from 'stores/knowledge';
import { KnowledgeBase } from 'src/types/knowledge';

const knowledgeStore = useKnowledgeStore();

const selectedKnowledgeBases = defineModel<string[]>();
</script>

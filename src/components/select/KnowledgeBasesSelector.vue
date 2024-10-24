<template>
  <q-select
    v-model="selectedKnowledgeBases"
    :disable="!knowledgeStore.isLoaded || knowledgeStore.knowledgeBases.length === 0"
    :label="knowledgeStore.knowledgeBases.length === 0 ? 'No knowledge base found' : undefined"
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
import { KnowledgeBase } from 'src/types/knowledge';
import { useKnowledgeStore } from 'stores/knowledge';

const knowledgeStore = useKnowledgeStore();

const selectedKnowledgeBases = defineModel<string[]>();
</script>

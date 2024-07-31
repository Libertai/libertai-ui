<template>
  <router-view />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useKnowledgeStore } from 'stores/knowledge';

const knowledgeStore = useKnowledgeStore();

onMounted(() => {
  // Set the knowledge store to load when the app is mounted
  knowledgeStore.load();
});
</script>

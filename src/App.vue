<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useChatsStore } from 'stores/chats-store';
import { useKnowledgeStore } from './stores/knowledge-store';

const chatsStore = useChatsStore();
const knowledgeStore = useKnowledgeStore();
onMounted(() => {
  // Set the knowledge store and chats store to load when the app is mounted
  knowledgeStore.load();
  chatsStore.load();
});
</script>

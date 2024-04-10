<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import { useChatsStore } from 'stores/chats-store';
import { useKnowledgeStore } from './stores/knowledge-store';

export default defineComponent({
  name: 'App',
  setup() {
    const chatsStore = useChatsStore();
    const knowledgeStore = useKnowledgeStore();
    onMounted(() => {
      // Set the knowledge store and chats store to load when the app is mounted
      knowledgeStore.load();
      chatsStore.load();
    });
    return {};
  },
});
</script>

<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted } from "vue";
import { useModelsStore } from "stores/models-store";
import { useChatsStore } from "stores/chats-store";
import { useKnowledgeStore } from "./stores/knowledge-store";

export default defineComponent({
  name: "App",
  setup() {
    console.log("App.vue::setup");
    const modelsStore = useModelsStore();
    const chatsStore = useChatsStore();
    const knowledgeStore = useKnowledgeStore();
    onMounted(() => {
      // Set the knowledge store and chats store to load when the app is mounted
      knowledgeStore.load();
      chatsStore.loadAndUpdate(modelsStore.models);
    });
    return {};
  },
});
</script>

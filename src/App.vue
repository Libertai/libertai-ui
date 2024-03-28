<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import { useChats } from 'stores/chats'
import { useKnowledgeDBStore } from './stores/knowledge-db'

export default defineComponent({
  name: 'App',
  setup() {
    const chats = useChats()
    chats.loadFromStorage()
    const knowledge = useKnowledgeDBStore()
    knowledge.loadFromStorage()
    return {}
  }
})
</script>
./stores/knowledge-db
<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import { useChats } from 'stores/chats'
import { useKnowledgeDBStore } from './stores/knowledgeDB'

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

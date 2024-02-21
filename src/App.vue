<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import {useChats} from 'stores/chats'

export default defineComponent({
  name: 'App',
  setup() {
    const chats = useChats()
    chats.loadFromStorage()
    return {}
  }
})
</script>

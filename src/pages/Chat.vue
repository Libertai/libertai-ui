<template>
    <q-page class="flex flex-center">
      <img
        alt="Quasar logo"
        src="~assets/quasar-logo-vertical.svg"
        style="width: 200px; height: 200px"
      >
      <button v-on:click="counter.counter++">Count is: {{ counter.counter }}</button>
    </q-page>
  </template>
  
  <script>
  import { defineComponent, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useChats } from '../stores/chats'
  
  export default defineComponent({
    name: 'ChatPage',
    setup() {
      const route = useRoute()
      const chat = ref()
      const chats = useChats()
      watch(
        () => route.params.id,
        async newId => {
          userData.value = await chats.getChat(newId)
        }
      )
    }
  })
  </script>
  
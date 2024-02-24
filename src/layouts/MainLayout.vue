<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <!-- <q-toolbar-title>
          Quasar App
        </q-toolbar-title> -->
        <q-space />

        <div class="row q-gutter-x-sm">
          <q-btn unelevated rounded color="white" text-color="primary" no-caps class="text-semibold" label="Earn Points" to="/points" />
          <q-btn color="primary" class="text-semibold border-primary-highlight" rounded unelevated no-caps>Connect Wallet</q-btn>
      
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      class="bg-secondary column flex-grow"
    >
      <!-- image link with the logo -->
      <q-item
        clickable
        to="/"
        class="q-mb-md"
      >
        <img src="~assets/libertai.svg" alt="Libertai">
      </q-item>
      <q-btn color="primary" class="q-mx-md q-my-lg text-semibold border-primary-highlight" rounded unelevated no-caps to="/new">New Chat</q-btn>
      <q-list class="col-grow" dense>
        <q-item-label
          header class="text-uppercase text-bold"
        >
          Chats
        </q-item-label>
        <q-item v-for="chat of chats.chats" :key="chat.id" :to="`/chat/${chat.id}`" exact exact-active-class="bg-dark" class="text-white q-mx-md rounded-borders">
          <q-item-section>
            <q-item-label>
              {{ chat.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <!-- socials and support links (follow us, support, disclaimer) -->
      <q-list>
        <q-separator />

        <q-item
          href="https://twitter.com/libertai_dai"
          target="_blank">
          <q-item-section avatar>
            <q-icon name="twitter" />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              Follow us
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="twitter" />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              Disclaimer
            </q-item-label>
          </q-item-section>
        </q-item>
        <!-- powered by aleph.im -->
        <q-item
          clickable
          href="https://aleph.im" 
          target="_blank"
        >
          <q-item-section avatar>
            <img src="~assets/aleph-im-logo.png" alt="aleph.im" style="width: 24px; height: 24px">
          </q-item-section>

          <q-item-section>
            <q-item-label>
              Powered by aleph.im
            </q-item-label>

            <q-item-label caption>
              Decentralized Cloud
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import {useChats} from '../stores/chats'
import {usePrompts} from '../stores/prompts'
import {useModels} from '../stores/models'

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
]

export default defineComponent({
  name: 'MainLayout',

  setup () {
    const leftDrawerOpen = ref(false)

    const models = useModels()
    const chats = useChats()
    const prompts = usePrompts()


    return {
      essentialLinks: linksList,
      chats,
      models,
      prompts,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>

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

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      class="bg-secondary"
    >
      <!-- image link with the logo -->
      <q-item
        clickable
        to="/"
      >
        <img src="~assets/libertai.svg" alt="Libertai">
      </q-item>
      <q-btn-dropdown color="primary" label="Start new chat" rounded unelevated no-caps class="q-mx-md">
        <q-list>
          <q-item clickable v-close-popup @click="onItemClick">
            <q-item-section>
              <q-item-label>Photos</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="onItemClick">
            <q-item-section>
              <q-item-label>Videos</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="onItemClick">
            <q-item-section>
              <q-item-label>Articles</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-list>
        <q-item-label
          header
        >
          Chat with Libertai
        </q-item-label>

        {{ chats.chats }}
      </q-list>
      <!-- spacer in the flex -->
      <div class="q-pa-md"></div> 
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

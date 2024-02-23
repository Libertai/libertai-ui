
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'vocal', component: () => import('pages/VocalChat.vue') },
      { path: 'new', component: () => import('pages/NewChat.vue') },
      // chat view with chat id
      { path: 'chat/:id', component: () => import('pages/Chat.vue')}
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

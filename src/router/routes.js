
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '', redirect: '/new' },
      { path: 'vocal', component: () => import('pages/VocalChat.vue') },
      { path: 'new', name: 'new-chat', component: () => import('pages/NewChat.vue') },
      // chat view with chat id
      { path: 'chat/:id', name: 'chat', component: () => import('pages/Chat.vue')},
      { path: 'points', component: () => import('src/pages/PointsInfo.vue')},
      { path: 'points/:address', name: 'points-detail', component: () => import('src/pages/PointsDetail.vue')}
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

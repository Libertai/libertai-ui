const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/new' },
      {
        path: 'new',
        name: 'new-chat',
        component: () => import('pages/NewChat.vue'),
      },
      {
        path: 'chat/:id',
        name: 'chat',
        component: () => import('pages/Chat.vue'),
      },
      { path: 'tokens', component: () => import('pages/TokensInfo.vue') },
      {
        path: 'tokens/:address',
        name: 'tokens-detail',
        component: () => import('pages/TokensDetail.vue'),
      },
      {
        path: 'knowledge-base',
        component: () => import('pages/KnowledgeBasesList.vue'),
      },
      {
        path: 'knowledge-base/:id',
        component: () => import('pages/KnowledgeBase.vue'),
      },
      {
        path: 'persona-management',
        component: () => import('pages/PersonaManagement.vue'),
      },
      {
        path: 'subscriptions',
        component: () => import('pages/Subscriptions.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

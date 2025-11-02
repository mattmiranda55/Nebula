import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    // Desktop is the primary (and currently only) UI for this app. Make it the default route.
    children: [{ path: '', component: () => import('pages/DesktopClientPage.vue') }],
  },

  {
    path: '/desktop',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/DesktopClientPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

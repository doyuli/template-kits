import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/home/index.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../pages/about/index.vue'),
    },
  ],
})

export default router

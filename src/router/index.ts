/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/login',
      name: 'login',
      component: () => import('@/pages/user/login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/user/register',
      name: 'register',
      component: () => import('@/pages/user/register.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/retrospective/new',
      name: 'new-retro',
      component: () => import('@/pages/retrospective/new.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/retrospective/templates',
      name: 'templates',
      component: () => import('@/pages/retrospective/templates.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/retrospective/past',
      name: 'past-retros',
      component: () => import('@/pages/retrospective/past.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/retrospective/:id',
      name: 'retro',
      component: () => import('@/pages/retrospective/retro.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/team-dashboard',
      name: 'team-dashboard',
      component: () => import('@/pages/team/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/pages/analytics/index.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.isInitialized) {
    await authStore.init()
  }

  if (to.meta.requiresAuth && !authStore.user) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && authStore.user) {
    next({ name: 'home' })
  } else {
    next()
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router

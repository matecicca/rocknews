/**
 * @file router/index.js
 * @description Configuración de rutas principales con soporte para meta.requiresAuth.
 */
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Feed from '@/pages/Feed.vue'
import Community from '@/pages/Community.vue'
import Profile from '@/pages/Profile.vue'
import EditProfile from '@/pages/EditProfile.vue'
import Me from '@/pages/Me.vue'
import Auth from '@/pages/Auth.vue'
import PrivateChat from '@/pages/PrivateChat.vue'
import { useAuth } from '@/composables/useAuth'
import NotFound from '@/pages/NotFound.vue'

/**
 * Definición de rutas principales
 */
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/feed', name: 'Feed', component: Feed },
  { path: '/community', name: 'Community', component: Community, meta: { requiresAuth: true } },
  { path: '/profile/:id', name: 'Profile', component: Profile, props: true, meta: { requiresAuth: true } },
  {
    path: '/me',
    name: 'Me',
    component: Me,
    meta: { requiresAuth: true }
  },
  {
  path: '/edit-profile',
  name: 'EditProfile',
  component: EditProfile,
  meta: { requiresAuth: true },
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    meta: { guestOnly: true }
  },
  {
    path: '/messages/:id',
    name: 'PrivateChat',
    component: PrivateChat,
    meta: { requiresAuth: true }
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

/**
 * Creación del router con historial HTML5
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

/**
  Guard global para proteger rutas
 */
router.beforeEach(async (to, _from, next) => {
  const { getSession } = useAuth()
  const session = await getSession()
  const isLoggedIn = !!session

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'Auth', query: { redirect: to.fullPath } })
  }

  // Rutas solo para invitados (por ejemplo /auth)
  if (to.meta.guestOnly && isLoggedIn) {
    return next({ name: 'Me' })
  }

  next()
})

export default router

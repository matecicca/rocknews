/**
 * @file useAuth.js
 * @description Composable para manejar la autenticación global de Supabase.
 */

import { ref } from 'vue'
import {
  getSession as apiGetSession,
  signOut as apiSignOut,
  onAuthStateChange
} from '@/services/authService'

const session = ref(null)
let initialized = false

/**
 * Hook reactivo para la autenticación de usuario.
 * @returns {object} Estado y métodos de autenticación.
 * @property {import('vue').Ref<object|null>} session - Sesión actual.
 * @property {Function} getSession - Devuelve la sesión actual, cargándola si es necesario.
 * @property {Function} signOut - Cierra sesión y sincroniza el estado global.
 */
export function useAuth() {
  // Inicializar una única vez en toda la app
  if (!initialized) {
    initialized = true
    syncSession()
    onAuthStateChange((_event, newSession) => (session.value = newSession))
  }

  /** Sincroniza la sesión con Supabase */
  async function syncSession() {
    session.value = await apiGetSession()
  }

  /**
   * Devuelve la sesión actual.
   * @returns {Promise<object|null>} Sesión actual o null si no hay usuario autenticado.
   */
  async function getSession() {
    if (!session.value) await syncSession()
    return session.value
  }

  /**
   * Cierra la sesión actual y actualiza el estado global.
   * @returns {Promise<void>}
   */
  async function signOut() {
    await apiSignOut()
    await syncSession()
  }

  return { session, getSession, signOut }
}

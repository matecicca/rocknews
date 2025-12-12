/**
 * @file useAdmin.js
 * @description Composable para manejar el estado de administrador del usuario actual.
 * Este composable es independiente de useAuth para no afectar la funcionalidad existente.
 */

import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth'
import { getProfile } from '@/services/profileService'

const isAdmin = ref(false)
const adminProfile = ref(null)
const adminLoading = ref(false)
let initialized = false

/**
 * Hook reactivo para el estado de administrador.
 * @returns {object} Estado y métodos relacionados con el rol admin.
 * @property {import('vue').Ref<boolean>} isAdmin - Indica si el usuario actual es administrador.
 * @property {import('vue').Ref<object|null>} adminProfile - Perfil del usuario actual con is_admin.
 * @property {import('vue').Ref<boolean>} adminLoading - Indica si está cargando el estado admin.
 * @property {Function} refreshAdminStatus - Recarga el estado de administrador.
 * @property {Function} clearAdminStatus - Limpia el estado de administrador (para logout).
 */
export function useAdmin() {
  const { session } = useAuth()

  // Inicializar watchers una única vez
  if (!initialized) {
    initialized = true

    // Observar cambios en la sesión para actualizar el estado de admin
    watch(
      () => session.value,
      async (newSession) => {
        if (newSession?.user?.id) {
          await loadAdminStatus(newSession.user.id)
        } else {
          clearAdminStatus()
        }
      },
      { immediate: true }
    )
  }

  /**
   * Carga el estado de administrador desde el perfil del usuario.
   * @param {string} userId - ID del usuario.
   */
  async function loadAdminStatus(userId) {
    if (!userId) {
      clearAdminStatus()
      return
    }

    adminLoading.value = true
    try {
      const profile = await getProfile(userId)
      if (profile) {
        adminProfile.value = profile
        isAdmin.value = profile.is_admin === true
      } else {
        clearAdminStatus()
      }
    } catch (error) {
      console.error('Error loading admin status:', error)
      clearAdminStatus()
    } finally {
      adminLoading.value = false
    }
  }

  /**
   * Refresca el estado de administrador del usuario actual.
   * @returns {Promise<void>}
   */
  async function refreshAdminStatus() {
    const userId = session.value?.user?.id
    if (userId) {
      await loadAdminStatus(userId)
    }
  }

  /**
   * Limpia el estado de administrador.
   * Se llama al cerrar sesión o cuando no hay usuario.
   */
  function clearAdminStatus() {
    isAdmin.value = false
    adminProfile.value = null
  }

  return {
    isAdmin: computed(() => isAdmin.value),
    adminProfile: computed(() => adminProfile.value),
    adminLoading: computed(() => adminLoading.value),
    refreshAdminStatus,
    clearAdminStatus
  }
}

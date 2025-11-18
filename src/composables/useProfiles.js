/**
 * @file useProfiles.js
 * @description Composable para manejar el listado de perfiles públicos.
 */

import { ref } from 'vue'
import { listProfiles } from '@/services/profileService'

const profiles = ref([])
const loading = ref(false)

/**
 * Hook reactivo para la obtención de perfiles de usuario.
 * @returns {object} Estado y funciones relacionadas con los perfiles.
 * @property {import('vue').Ref<object[]>} profiles - Lista reactiva de perfiles.
 * @property {import('vue').Ref<boolean>} loading - Estado de carga.
 * @property {Function} fetchProfiles - Carga los perfiles desde la base de datos.
 */
export function useProfiles() {
  /**
   * Carga los perfiles públicos.
   * @param {object} [options] - Opciones de búsqueda.
   * @param {number} [options.limit=50] - Cantidad máxima de perfiles a obtener.
   * @returns {Promise<void>}
   */
  async function fetchProfiles({ limit = 50 } = {}) {
    loading.value = true
    profiles.value = await listProfiles({ limit })
    loading.value = false
  }

  return { profiles, loading, fetchProfiles }
}

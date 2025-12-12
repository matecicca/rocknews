/**
 * @file useFeed.js
 * @description Composable para manejar el feed de publicaciones y su actualización en tiempo real.
 */

import { ref } from 'vue'
import { listFeed, subscribeToPosts } from '@/services/postService'

const posts = ref([])
const loading = ref(false)
const loadingMore = ref(false)
let unsubscribe = null

/**
 * Hook reactivo para la gestión del feed.
 * @returns {object} Estado y funciones del feed.
 * @property {import('vue').Ref<object[]>} posts - Lista reactiva de publicaciones.
 * @property {import('vue').Ref<boolean>} loading - Estado de carga inicial.
 * @property {import('vue').Ref<boolean>} loadingMore - Estado de carga adicional (paginación).
 * @property {Function} fetchFirstPage - Carga los primeros posts y activa la subscripción realtime.
 * @property {Function} fetchNextPage - Carga publicaciones adicionales.
 * @property {Function} prepend - Inserta un nuevo post al inicio del feed.
 * @property {Function} stopRealtime - Detiene la subscripción en tiempo real.
 */
export function useFeed() {
  /**
   * Carga los primeros posts del feed.
   * @returns {Promise<void>}
   */
  async function fetchFirstPage() {
    loading.value = true
    posts.value = await listFeed({ limit: 20 })
    loading.value = false

    // Iniciar subscripción realtime solo una vez
    if (!unsubscribe) unsubscribe = subscribeToPosts(handleRealtime)
  }

  /**
   * Carga más publicaciones (paginación simple).
   * @returns {Promise<void>}
   */
  async function fetchNextPage() {
    loadingMore.value = true
    const more = await listFeed({ limit: 20 })
    posts.value = [...posts.value, ...more]
    loadingMore.value = false
  }

  /**
   * Inserta una nueva publicación al inicio del feed.
   * @param {object} post - Objeto de la publicación.
   */
  function prepend(post) {
    posts.value.unshift(post)
  }

  /**
   * Maneja los cambios en tiempo real del feed.
   * @param {object} post - Publicación afectada.
   * @param {string} eventType - Tipo de evento (INSERT, UPDATE, DELETE).
   */
  function handleRealtime(post, eventType) {
    if (eventType === 'INSERT') {
      // Solo agregar si no existe ya (evita duplicados cuando se crea localmente)
      if (!posts.value.find(p => p.id === post.id)) {
        prepend(post)
      }
    }
    if (eventType === 'UPDATE') {
      const index = posts.value.findIndex(p => p.id === post.id)
      if (index !== -1) posts.value[index] = post
    }
    if (eventType === 'DELETE') {
      posts.value = posts.value.filter(p => p.id !== post.id)
    }
  }

  /**
   * Cancela la subscripción en tiempo real.
   * @returns {void}
   */
  function stopRealtime() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  return { posts, loading, loadingMore, fetchFirstPage, fetchNextPage, prepend, stopRealtime }
}

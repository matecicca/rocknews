/**
 * @file useFeed.js
 * @description Composable para manejar el feed de publicaciones y su actualización en tiempo real.
 */

import { ref, onUnmounted } from 'vue'
import { listFeed, subscribeToPosts } from '@/services/postService'

const posts = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
// false = más nuevas primero (descendente), true = más antiguas primero (ascendente)
const sortAscending = ref(false)
let unsubscribe = null

/**
 * Hook reactivo para la gestión del feed.
 * @returns {object} Estado y funciones del feed.
 * @property {import('vue').Ref<object[]>} posts - Lista reactiva de publicaciones.
 * @property {import('vue').Ref<boolean>} loading - Estado de carga inicial.
 * @property {import('vue').Ref<boolean>} loadingMore - Estado de carga adicional (paginación).
 * @property {import('vue').Ref<boolean>} sortAscending - Dirección del orden (false = más nuevas primero).
 * @property {Function} fetchFirstPage - Carga los primeros posts y activa la subscripción realtime.
 * @property {Function} fetchNextPage - Carga publicaciones adicionales.
 * @property {Function} toggleSortOrder - Cambia el orden de las publicaciones.
 * @property {Function} stopRealtime - Detiene la subscripción en tiempo real.
 */
export function useFeed() {
  /**
   * Carga los primeros posts del feed.
   * @returns {Promise<void>}
   */
  async function fetchFirstPage() {
    loading.value = true
    error.value = null
    try {
      posts.value = await listFeed({ limit: 20, ascending: sortAscending.value })
      // Iniciar subscripción realtime solo una vez
      if (!unsubscribe) unsubscribe = subscribeToPosts(handleRealtime)
    } catch (err) {
      console.error('Error cargando feed:', err)
      error.value = err.message || 'Error al cargar el feed'
      posts.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Carga más publicaciones (paginación simple).
   * @returns {Promise<void>}
   */
  async function fetchNextPage() {
    loadingMore.value = true
    try {
      const more = await listFeed({ limit: 20, ascending: sortAscending.value })
      posts.value = [...posts.value, ...more]
    } catch (err) {
      console.error('Error cargando más posts:', err)
      error.value = err.message || 'Error al cargar más publicaciones'
    } finally {
      loadingMore.value = false
    }
  }

  /**
   * Cambia el orden de las publicaciones y recarga el feed.
   * @returns {Promise<void>}
   */
  async function toggleSortOrder() {
    sortAscending.value = !sortAscending.value
    await fetchFirstPage()
  }

  /**
   * Inserta un post en la posición correcta según el orden actual.
   * @param {object} post - Publicación a insertar.
   */
  function insertPostInOrder(post) {
    if (sortAscending.value) {
      // Orden ascendente: más antiguas primero, nuevas al final
      posts.value.push(post)
    } else {
      // Orden descendente: más nuevas primero, nuevas al inicio
      posts.value.unshift(post)
    }
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
        insertPostInOrder(post)
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

  // Limpiar subscripción automáticamente cuando el componente se desmonte
  onUnmounted(() => {
    stopRealtime()
  })

  return { posts, loading, loadingMore, error, sortAscending, fetchFirstPage, fetchNextPage, toggleSortOrder, stopRealtime }
}

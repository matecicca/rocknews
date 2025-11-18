/**
 * @file usePrivateChat.js
 * @description Composable para manejar chat privado entre dos usuarios.
 */
import { ref, onUnmounted } from 'vue'
import {
  getOrCreateConversation,
  listPrivateMessages,
  sendPrivateMessage,
  subscribeToPrivateMessages
} from '@/services/privateChatService'
import { useAuth } from '@/composables/useAuth'

export function usePrivateChat(otherUserId) {
  const { session, getSession } = useAuth()
  const messages = ref([])
  const loading = ref(true)
  const conversationId = ref(null)
  let unsubscribe = null

  /**
   * Inicializa el chat entre el usuario autenticado y el otro usuario.
   * Carga mensajes previos y suscribe en tiempo real.
   */
  async function initChat() {
    try {
      loading.value = true

      // Esperar sesión establecida
      const s = await getSession()
      if (!s?.user?.id) {
        console.warn('No hay sesión activa en initChat')
        loading.value = false
        return
      }

      const userId = s.user.id
      if (!otherUserId) {
        console.error('No se recibió otherUserId')
        loading.value = false
        return
      }

      // Buscar o crear conversación
      const conv = await getOrCreateConversation(userId, otherUserId)
      conversationId.value = conv?.id

      if (!conv?.id) {
        console.error('No se obtuvo ID de conversación')
        loading.value = false
        return
      }

      // Cargar mensajes
      messages.value = await listPrivateMessages(conv.id)

      // Escuchar Realtime
      listenRealtime(conv.id)

      loading.value = false
    } catch (err) {
      console.error('Error en initChat:', err)
      loading.value = false
    }
  }

  /**
   * Suscribirse a nuevos mensajes en tiempo real.
   */
  function listenRealtime(convId) {
    // Evitar duplicar listeners
    if (unsubscribe) unsubscribe()

    unsubscribe = subscribeToPrivateMessages(convId, msg => {
      // Evitar mensajes duplicados
      if (!messages.value.find(m => m.id === msg.id)) {
        messages.value.push(msg)
      }
    })
  }

  /**
   * Enviar un nuevo mensaje.
   */
  async function sendMessage(content) {
    const s = await getSession()
    if (!conversationId.value || !s?.user?.id) {
      console.error('No hay sesión o conversación activa')
      return
    }

    const msg = await sendPrivateMessage(conversationId.value, s.user.id, content)
    messages.value.push(msg)
  }

  /**
   * Limpiar suscripción al desmontar componente.
   */
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  return { messages, loading, initChat, sendMessage }
}

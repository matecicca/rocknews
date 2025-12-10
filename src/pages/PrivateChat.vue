<template>
    <section class="max-w-4xl mx-auto px-4 py-6 text-white">
      <div v-if="loading" class="text-gray-400 text-center py-10">Cargando conversación...</div>

      <div v-else class="bg-gray-800 rounded-xl shadow border border-gray-700 flex flex-col h-[80vh]">
        <header class="bg-gray-900 border-b border-gray-700 px-4 py-3 text-center">
          <h2 class="font-semibold text-lg m-0">Conversación con {{ otherUserName || 'Usuario' }}</h2>
        </header>

        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="msg.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[70%] p-3 rounded-lg break-words"
              :class="msg.sender_id === session?.user?.id
                ? 'bg-gray-700 text-white'
                : 'bg-gray-900 text-gray-300'"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSend" class="border-t border-gray-700 p-4 flex gap-3">
          <label for="chat-message" class="sr-only">Mensaje de chat</label>
          <input
            id="chat-message"
            v-model="newMessage"
            type="text"
            placeholder="Escribí tu mensaje..."
            class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
          <button
            type="submit"
            class="btn btn-primary px-6"
            :disabled="!newMessage.trim()"
          >
            Enviar
          </button>
        </form>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { usePrivateChat } from '@/composables/usePrivateChat'
  import { getProfile } from '@/services/profileService'
  
  // Estado y dependencias
  const route = useRoute()
  const { session, getSession } = useAuth()
  const otherUserId = route.params.id
  const newMessage = ref('')
  const otherUserName = ref('')
  const { messages, loading, initChat, sendMessage } = usePrivateChat(otherUserId)
  
  // Función para enviar mensaje
  async function handleSend() {
    if (!newMessage.value.trim()) return
    await sendMessage(newMessage.value.trim())
    newMessage.value = ''
  }
  
  onMounted(async () => {
  // Validar que hay sesión activa
  const userSession = await getSession()
  if (!userSession?.user?.id) {
    console.warn('No hay sesión activa — redirigiendo a auth')
    window.location.href = '/auth'
    return
  }

  // Cargar datos del otro usuario
  try {
    const profile = await getProfile(otherUserId)
    otherUserName.value = profile?.username || 'Usuario'
  } catch (e) {
    console.error('Error cargando perfil:', e)
  }

  await initChat()
})
  </script>
  
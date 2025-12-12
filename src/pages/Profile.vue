<template>
  <section
    class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 max-w-6xl mx-auto px-4 py-10 text-white"
  >
    <div
      class="bg-gray-800 p-6 rounded-xl shadow border border-gray-700 overflow-y-auto max-h-[80vh]"
    >
      <h2 class="text-xl font-semibold text-white mb-4">
        Publicaciones de {{ profile?.username ? '@' + profile.username : 'usuario' }}
      </h2>

      <div v-if="loadingPosts" class="text-gray-400 text-sm">
        Cargando publicaciones...
      </div>

      <div v-else-if="userPosts.length === 0" class="text-gray-500 text-sm">
        Este usuario todavía no ha publicado nada.
      </div>

      <div v-else class="flex flex-col items-center gap-4">
        <PostCard
          v-for="post in userPosts"
          :key="post.id"
          :post="post"
          class="w-full max-w-2xl"
        />
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <div class="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
        <div v-if="!loading && profile" class="flex justify-center mb-4">
          <div class="w-24 h-24 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="profile.username"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-gray-300 font-semibold text-3xl">
              {{ (profile.username || 'U').charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-3">
          <h2 class="text-xl font-semibold text-white">Perfil</h2>
          <!-- Badge de administrador -->
          <span v-if="profile?.is_admin" class="admin-badge">
            Admin
          </span>
        </div>

        <div v-if="loading" class="text-gray-400 text-sm">Cargando perfil...</div>
        <div v-else-if="!profile" class="text-gray-500 text-sm">
          Usuario no encontrado.
        </div>

        <div v-else class="text-sm text-gray-400 space-y-1 mt-2">
          <p><strong>Username:</strong> {{ profile.username || '—' }}</p>
          <p><strong>Nombre:</strong> {{ profile.full_name || '—' }}</p>
          <p><strong>Bio:</strong> {{ profile.bio || '—' }}</p>
        </div>

        <div v-if="session?.user?.id !== profile?.id" class="mt-4">
          <button
            type="button"
            @click="handlePrivateMessage"
            class="w-full btn btn-primary text-sm py-2 px-4 mt-2 transition hover:bg-gray-700"
          >
            Enviar mensaje privado
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getProfile, getAvatarUrl } from '@/services/profileService'
import { listUserPosts } from '@/services/postService'
import { getOrCreateConversation } from '@/services/privateChatService'
import PostCard from '@/components/PostCard.vue'

const route = useRoute()
const router = useRouter()
const { getSession, session } = useAuth()

const profile = ref(null)
const loading = ref(true)
const loadingPosts = ref(true)
const userPosts = ref([])

const avatarUrl = computed(() => getAvatarUrl(profile.value?.avatar_path))

onMounted(async () => {
  const id = route.params.id

  // Cargar perfil del usuario seleccionado
  profile.value = await getProfile(id)
  loading.value = false

  // Cargar publicaciones del usuario
  try {
    userPosts.value = await listUserPosts(id)
  } catch (error) {
    console.error('Error cargando publicaciones:', error)
  } finally {
    loadingPosts.value = false
  }
})

/**
 * Crear conversación y redirigir al chat privado
 */
async function handlePrivateMessage() {
  try {
    const userSession = await getSession()
    if (!userSession?.user?.id) {
      router.push('/auth')
      return
    }

    const currentUserId = userSession.user.id
    const otherUserId = profile.value.id

    // Crear o recuperar conversación
    const conversation = await getOrCreateConversation(currentUserId, otherUserId)

    // Redirigir a la vista de mensajes
    router.push(`/messages/${otherUserId}`)
  } catch (error) {
    console.error('Error iniciando chat privado:', error)
  }
}
</script>

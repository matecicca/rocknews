<template>
  <section
    class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 max-w-6xl mx-auto px-4 py-10 text-white"
  >
    <div
      class="bg-gray-800 p-6 rounded-xl shadow border border-gray-700 overflow-y-auto max-h-[80vh]"
    >
      <h2 class="text-xl font-semibold text-white mb-4">Mis publicaciones</h2>

      <Loader v-if="loadingPosts" size="sm" text="Cargando publicaciones..." />

      <div v-else-if="userPosts.length === 0" class="text-gray-500 text-sm">
        Todavía no has publicado nada.
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
        <div class="flex justify-center mb-4">
          <div class="w-24 h-24 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="username"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-gray-300 font-semibold text-3xl">
              {{ (username || 'U').charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-3">
          <h2 class="text-xl font-semibold text-white">Mi cuenta</h2>
          <!-- Badge de administrador -->
          <span v-if="isAdmin" class="admin-badge">
            Admin
          </span>
        </div>

        <p class="text-sm text-gray-400 mb-1">
          <strong>Estado:</strong> {{ session ? 'Conectado' : 'Desconectado' }}
        </p>

        <div v-if="session" class="text-sm text-gray-400 space-y-1 mt-2">
          <p><strong>Email:</strong> {{ session.user.email }}</p>
          <p><strong>Username:</strong> {{ username || '—' }}</p>
          <p><strong>Nombre:</strong> {{ full_name || '—' }}</p>
          <p><strong>Bio:</strong> {{ bio || '—' }}</p>
        </div>

        <div class="mt-5 flex flex-wrap gap-2">
          <RouterLink
            to="/edit-profile"
            class="btn btn-primary btn-nowrap"
            :class="{ 'opacity-50 pointer-events-none': !session }"
          >
            Editar perfil
          </RouterLink>
          <button
            type="button"
            class="btn btn-primary btn-nowrap"
            @click="logout"
            :disabled="!session"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, onActivated } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useAdmin } from '@/composables/useAdmin'
import { getProfile, getAvatarUrl } from '@/services/profileService'
import { listUserPosts } from '@/services/postService'
import PostCard from '@/components/PostCard.vue'
import Loader from '@/components/Loader.vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'

const { session, getSession, signOut } = useAuth()
const { isAdmin } = useAdmin()
const showToast = inject('showToast', () => {})
const router = useRouter()

const username = ref('')
const full_name = ref('')
const bio = ref('')
const avatar_path = ref('')
const loadingPosts = ref(true)
const userPosts = ref([])

const avatarUrl = computed(() => getAvatarUrl(avatar_path.value))

async function loadProfile() {
  try {
    const userSession = await getSession()
    const userId = userSession?.user?.id
    if (!userId) return
    const profile = await getProfile(userId)
    if (profile) {
      username.value = profile.username || ''
      full_name.value = profile.full_name || ''
      bio.value = profile.bio || ''
      avatar_path.value = profile.avatar_path || ''
    }
  } catch (error) {
    showToast('No se pudo cargar el perfil.', 'error')
  }
}

async function loadUserPosts() {
  try {
    const userSession = await getSession()
    const userId = userSession?.user?.id
    if (!userId) return
    userPosts.value = await listUserPosts(userId)
  } finally {
    loadingPosts.value = false
  }
}

async function logout() {
  await signOut()
  showToast('Sesión cerrada correctamente 👋', 'success')
  username.value = ''
  full_name.value = ''
  bio.value = ''
  userPosts.value = []
  router.push('/auth')
}

// Verificar si el perfil fue actualizado recientemente
let lastProfileUpdate = ''

function checkProfileUpdate() {
  const updated = localStorage.getItem('profileUpdated')
  if (updated && updated !== lastProfileUpdate) {
    lastProfileUpdate = updated
    loadProfile()
    localStorage.removeItem('profileUpdated')
  }
}

// Handler para el evento visibilitychange
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    checkProfileUpdate()
  }
}

onMounted(() => {
  checkProfileUpdate()
  loadProfile()
  loadUserPosts()

  // Escuchar cuando la página vuelve a ser visible
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// Limpiar listener al desmontar
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// Refrescar automáticamente cuando el componente se activa (vuelve de otra vista)
onActivated(() => {
  checkProfileUpdate()
})

// También refrescar si la ruta se actualiza
onBeforeRouteUpdate(() => {
  checkProfileUpdate()
})
</script>

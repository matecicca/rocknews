<template>
  <section
    class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 max-w-6xl mx-auto px-4 py-10 text-white"
  >
    <!-- COLUMNA IZQUIERDA: publicaciones -->
    <div
      class="bg-gray-800 p-6 rounded-xl shadow border border-gray-700 overflow-y-auto max-h-[80vh]"
    >
      <h2 class="text-xl font-semibold text-white mb-4">Mis publicaciones</h2>

      <div v-if="loadingPosts" class="text-gray-400 text-sm">
        Cargando publicaciones...
      </div>

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

    <!-- COLUMNA DERECHA: perfil -->
    <div class="flex flex-col gap-6">
      <div class="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
        <!-- Avatar centrado -->
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

        <h2 class="text-xl font-semibold text-white mb-3">Mi cuenta</h2>

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
          <button class="btn btn-ghost btn-nowrap" @click="refreshProfile">
            Refrescar
          </button>
          <RouterLink
            to="/edit-profile"
            class="btn btn-primary btn-nowrap"
            :class="{ 'opacity-50 pointer-events-none': !session }"
          >
            Editar perfil
          </RouterLink>
          <button
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
import { ref, computed, onMounted, inject } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { getProfile, getAvatarUrl } from '@/services/profileService'
import { listUserPosts } from '@/services/postService'
import PostCard from '@/components/PostCard.vue'
import { useRouter } from 'vue-router'

const { session, getSession, signOut } = useAuth()
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
    const s = await getSession()
    const userId = s?.user?.id
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
    const s = await getSession()
    const userId = s?.user?.id
    if (!userId) return
    userPosts.value = await listUserPosts(userId)
  } finally {
    loadingPosts.value = false
  }
}

async function refreshProfile() {
  await loadProfile()
  await loadUserPosts()
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

onMounted(() => {
  loadProfile()
  loadUserPosts()
})
</script>

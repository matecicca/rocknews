<template>
  <div class="min-h-screen flex flex-col bg-gray-900 text-white">
    <header
      v-if="!isAuth"
      class="bg-black border-b border-gray-800 shadow-sm"
    >
      <nav
        class="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0"
      >
        <RouterLink
          to="/"
          class="hover:opacity-80 transition"
        >
          <img
            src="/rocknews-logo.png"
            alt="Rocknews"
            class="h-10"
          />
        </RouterLink>

        <div class="flex items-center gap-3 sm:gap-4">
          <RouterLink
            to="/feed"
            class="text-gray-300 hover:text-white transition-colors"
          >
            Feed
          </RouterLink>

          <RouterLink
            to="/community"
            class="text-gray-300 hover:text-white transition-colors"
          >
            Comunidad
          </RouterLink>

          <RouterLink
            v-if="isLoggedIn"
            to="/me"
            class="btn btn-primary btn-nowrap flex items-center gap-2"
          >
            <div class="w-7 h-7 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                v-if="currentAvatarUrl"
                :src="currentAvatarUrl"
                :alt="currentDisplayName"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-gray-300 text-sm font-semibold">
                {{ currentInitial }}
              </span>
            </div>
            <span class="hidden sm:inline">{{ currentDisplayName || 'Mi perfil' }}</span>
          </RouterLink>

          <RouterLink
            v-if="!isLoggedIn"
            to="/auth"
            class="btn btn-primary btn-nowrap"
          >
            Ingresar
          </RouterLink>

          <button
            v-else
            type="button"
            @click="logout"
            class="btn btn-ghost btn-nowrap"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
    </header>

    <main class="flex-1 text-white">
      <slot />
    </main>

    <footer
      v-if="!isAuth"
      class="bg-black border-t border-gray-800 text-gray-400 text-sm"
    >
      <div
        class="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0"
      >
        <span>© 2025 Rocknews</span>
        <span class="text-gray-500">Hecho por la comunidad</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getProfile, getAvatarUrl } from '@/services/profileService'

const router = useRouter()
const route = useRoute()
const { session, signOut } = useAuth()

const isLoggedIn = computed(() => !!session.value)
const isAuth = computed(() => route.name === 'Auth')

// Datos del perfil del usuario actual para el encabezado
const currentProfile = ref(null)

const currentAvatarUrl = computed(() => getAvatarUrl(currentProfile.value?.avatar_path))

const currentDisplayName = computed(() => {
  if (!currentProfile.value) return ''
  return currentProfile.value.username || currentProfile.value.full_name || ''
})

const currentInitial = computed(() => {
  const name = currentDisplayName.value
  return name ? name.charAt(0).toUpperCase() : 'U'
})

async function loadCurrentProfile() {
  const userId = session.value?.user?.id
  if (!userId) {
    currentProfile.value = null
    return
  }
  try {
    currentProfile.value = await getProfile(userId)
  } catch (e) {
    console.error('Error al cargar el perfil actual:', e)
    currentProfile.value = null
  }
}

// Observar cambios en la sesión para cargar el perfil
watch(() => session.value?.user?.id, (newId) => {
  if (newId) {
    loadCurrentProfile()
  } else {
    currentProfile.value = null
  }
}, { immediate: true })

// También verificar al montar y cuando cambia la visibilidad (en caso de que el perfil se haya actualizado)
onMounted(() => {
  if (session.value?.user?.id) {
    loadCurrentProfile()
  }

  // Escuchar actualizaciones del perfil
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && session.value?.user?.id) {
      const updated = localStorage.getItem('profileUpdated')
      if (updated) {
        loadCurrentProfile()
        localStorage.removeItem('profileUpdated')
      }
    }
  })
})

async function logout() {
  await signOut()
  currentProfile.value = null
  router.push('/')
}
</script>

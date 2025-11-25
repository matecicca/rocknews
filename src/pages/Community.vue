<template>
  <section class="max-w-6xl mx-auto px-4 py-10 text-white space-y-6">
    <h2 class="text-2xl font-semibold">Comunidad</h2>

    <div v-if="loading" class="text-gray-400">Cargando usuarios...</div>

    <ul v-else class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <li
        v-for="u in profiles"
        :key="u.id"
        @click="goToProfile(u.id)"
        class="user-card cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-4 transition-transform transform hover:-translate-y-1 hover:shadow-lg"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img
              v-if="getAvatarUrl(u.avatar_path)"
              :src="getAvatarUrl(u.avatar_path)"
              :alt="u.username"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-gray-300 font-semibold text-lg">
              {{ (u.username || 'U').charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="font-semibold text-white">
            {{ u.username || '(sin usuario)' }}
          </div>
        </div>
        <div class="text-sm text-gray-400">{{ u.full_name }}</div>
        <div class="text-xs text-gray-500">{{ u.bio }}</div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfiles } from '@/composables/useProfiles'
import { useAuth } from '@/composables/useAuth'
import { getAvatarUrl } from '@/services/profileService'

const { profiles, loading, fetchProfiles } = useProfiles()
const { session } = useAuth()
const router = useRouter()

function goToProfile(id) {
  // Si hay sesión y el ID clickeado coincide con el usuario logueado → redirige a /me
  const loggedUserId = session.value?.user?.id
  if (loggedUserId && id === loggedUserId) {
    router.push('/me')
  } else {
    router.push(`/profile/${id}`)
  }
}

onMounted(() => fetchProfiles({ limit: 50 }))
</script>

<style scoped>
.user-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.user-card:hover {
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.08);
}
</style>

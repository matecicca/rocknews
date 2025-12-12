<template>
  <section class="max-w-6xl mx-auto px-4 py-10 text-white space-y-6">
    <h2 class="text-2xl font-semibold">Comunidad</h2>

    <div v-if="loading" class="text-gray-400">Cargando usuarios...</div>

    <ul v-else class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <li
        v-for="u in profiles"
        :key="u.id"
        class="user-card rounded-lg border border-gray-700 bg-gray-800 p-4 transition-transform transform hover:-translate-y-1 hover:shadow-lg flex flex-col"
      >
        <!-- Contenido clickeable de la tarjeta -->
        <div
          role="button"
          tabindex="0"
          @click="goToProfile(u.id)"
          @keydown.enter="goToProfile(u.id)"
          @keydown.space.prevent="goToProfile(u.id)"
          class="cursor-pointer flex-1"
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
            <div>
              <div class="flex items-center gap-2">
                <span class="font-semibold text-white">
                  {{ u.username || '(sin usuario)' }}
                </span>
                <!-- Badge de administrador -->
                <span v-if="u.is_admin" class="admin-badge">
                  Admin
                </span>
              </div>
            </div>
          </div>
          <div class="text-sm text-gray-400">{{ u.full_name }}</div>
          <div class="text-xs text-gray-500 mb-3">{{ u.bio }}</div>
        </div>

        <!-- Botón de eliminación (solo visible para admin y no puede eliminarse a sí mismo) -->
        <div v-if="isAdmin && !isCurrentUser(u.id)" class="mt-auto pt-3 border-t border-gray-700">
          <button
            type="button"
            @click.stop="handleDeleteUser(u)"
            class="btn btn-admin-delete w-full"
          >
            Eliminar usuario
          </button>
        </div>
      </li>
    </ul>

    <!-- Modal de confirmación -->
    <ConfirmDialog
      :is-open="confirmDialogOpen"
      :title="confirmDialogData.title"
      :message="confirmDialogData.message"
      :preview="confirmDialogData.preview"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useProfiles } from '@/composables/useProfiles'
import { useAuth } from '@/composables/useAuth'
import { useAdmin } from '@/composables/useAdmin'
import { getAvatarUrl, adminDeleteProfile } from '@/services/profileService'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const { profiles, loading, fetchProfiles } = useProfiles()
const { session } = useAuth()
const { isAdmin } = useAdmin()
const router = useRouter()
const showToast = inject('showToast', () => {})

// Estados del modal de confirmación
const confirmDialogOpen = ref(false)
const confirmDialogData = ref({
  title: '',
  message: '',
  preview: '',
  onConfirm: null
})

function isCurrentUser(userId) {
  return session.value?.user?.id === userId
}

function goToProfile(id) {
  // Si hay sesión y el ID clickeado coincide con el usuario logueado → redirige a /me
  const loggedUserId = session.value?.user?.id
  if (loggedUserId && id === loggedUserId) {
    router.push('/me')
  } else {
    router.push(`/profile/${id}`)
  }
}

function handleDeleteUser(user) {
  confirmDialogData.value = {
    title: '¿Eliminar este usuario?',
    message: `Se eliminará permanentemente el usuario "${user.username || 'sin nombre'}" y todos sus datos asociados.`,
    preview: user.full_name || user.username || user.id,
    onConfirm: async () => {
      try {
        await adminDeleteProfile(user.id, user.avatar_path)

        // Remover el usuario del array local
        const index = profiles.value.findIndex(p => p.id === user.id)
        if (index !== -1) {
          profiles.value.splice(index, 1)
        }

        showToast('Usuario eliminado correctamente', 'success')
      } catch (err) {
        console.error('Error al eliminar usuario:', err)
        showToast(`Error al eliminar usuario: ${err.message || 'Por favor intenta nuevamente'}`, 'error')
      }
    }
  }

  confirmDialogOpen.value = true
}

async function handleConfirm() {
  if (confirmDialogData.value.onConfirm) {
    await confirmDialogData.value.onConfirm()
  }
  confirmDialogOpen.value = false
}

function handleCancel() {
  confirmDialogOpen.value = false
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

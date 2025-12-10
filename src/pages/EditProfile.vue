<template>
  <section class="max-w-3xl mx-auto px-4 py-10 text-white space-y-10">
    <RouterLink
      to="/me"
      class="inline-block bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-700 shadow hover:bg-gray-700 transition"
    >
      ← Volver al perfil
    </RouterLink>

    <form
      @submit.prevent="handleSave"
      class="bg-gray-800 p-6 rounded-xl shadow border border-gray-700 space-y-4"
    >
      <h2 class="text-xl font-semibold text-white">Editar perfil</h2>

      <div class="flex flex-col gap-4">
        <div>
          <label for="avatar" class="block text-sm text-gray-400 mb-2">Foto de perfil</label>
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
              <img
                v-if="avatarPreview"
                :src="avatarPreview"
                alt="Avatar preview"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-gray-400 text-2xl">
                {{ username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              @change="handleAvatarChange"
              class="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-700 file:bg-gray-900 file:text-white hover:file:bg-gray-700"
            />
          </div>
        </div>

        <div>
          <label for="username" class="block text-sm text-gray-400">Usuario</label>
          <input
            id="username"
            type="text"
            v-model="username"
            required
            class="input"
          />
        </div>

        <div>
          <label for="full_name" class="block text-sm text-gray-400">Nombre completo</label>
          <input id="full_name" type="text" v-model="full_name" class="input" />
        </div>

        <div>
          <label for="bio" class="block text-sm text-gray-400">Biografía</label>
          <textarea id="bio" v-model="bio" rows="4" class="textarea resize-none"></textarea>
        </div>

        <button
          type="submit"
          :disabled="loadingProfile"
          class="btn btn-primary w-full"
        >
          {{ loadingProfile ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>

    <div class="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
      <h2 class="text-lg font-semibold mb-4">Cambiar contraseña</h2>
      <form @submit.prevent="handlePasswordChange" class="flex flex-col gap-3">
        <label for="new-password" class="text-sm text-gray-400">Nueva contraseña</label>
        <input
          id="new-password"
          type="password"
          v-model="newPassword"
          minlength="6"
          placeholder="mínimo 6 caracteres"
          class="input"
        />
        <button
          type="submit"
          class="btn btn-ghost w-full"
        >
          Cambiar contraseña
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getProfile, upsertProfile, uploadAvatar, getAvatarUrl } from '@/services/profileService'
import { updatePassword } from '@/services/authService'

const { getSession } = useAuth()
const showToast = inject('showToast', () => {})

const username = ref('')
const full_name = ref('')
const bio = ref('')
const avatar_path = ref('')
const newPassword = ref('')
const loadingProfile = ref(false)
const avatarFile = ref(null)

const avatarPreview = computed(() => {
  if (avatarFile.value) {
    return URL.createObjectURL(avatarFile.value)
  }
  return getAvatarUrl(avatar_path.value)
})

async function loadProfile() {
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
}

function handleAvatarChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    avatarFile.value = file
  }
}

async function handleSave() {
  loadingProfile.value = true
  try {
    const userSession = await getSession()
    const userId = userSession?.user?.id

    let newAvatarPath = avatar_path.value

    // Subir avatar si hay uno nuevo
    if (avatarFile.value) {
      newAvatarPath = await uploadAvatar(avatarFile.value, userId)
    }

    await upsertProfile({
      id: userId,
      username: username.value,
      full_name: full_name.value,
      bio: bio.value,
      avatar_path: newAvatarPath
    })

    avatar_path.value = newAvatarPath
    avatarFile.value = null
    showToast('Perfil actualizado correctamente ✅', 'success')
  } catch (err) {
    console.error(err)
    showToast('Error al actualizar el perfil', 'error')
  } finally {
    loadingProfile.value = false
  }
}

async function handlePasswordChange() {
  if (newPassword.value.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres.', 'error')
    return
  }
  const { error } = await updatePassword(newPassword.value)
  if (error) showToast('Error al cambiar la contraseña.', 'error')
  else {
    showToast('Contraseña actualizada con éxito 🔒', 'success')
    newPassword.value = ''
  }
}

onMounted(loadProfile)
</script>

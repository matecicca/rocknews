<template>
  <section class="max-w-3xl mx-auto px-4 py-10 text-white space-y-10">
    <!-- Botón para volver -->
    <RouterLink
      to="/me"
      class="inline-block bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-700 shadow hover:bg-gray-700 transition"
    >
      ← Volver al perfil
    </RouterLink>

    <!-- Formulario de edición -->
    <form
      @submit.prevent="handleSave"
      class="bg-gray-800 p-6 rounded-xl shadow border border-gray-700 space-y-4"
    >
      <h2 class="text-xl font-semibold text-white">Editar perfil</h2>

      <div class="flex flex-col gap-4">
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

    <!-- Formulario de cambio de contraseña -->
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
import { ref, onMounted, inject } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getProfile, upsertProfile } from '@/services/profileService'
import { supabase } from '@/services/supabaseClient'

const router = useRouter()
const { getSession } = useAuth()
const showToast = inject('showToast', () => {})

const username = ref('')
const full_name = ref('')
const bio = ref('')
const newPassword = ref('')
const loadingProfile = ref(false)

async function loadProfile() {
  const s = await getSession()
  const userId = s?.user?.id
  if (!userId) return
  const profile = await getProfile(userId)
  if (profile) {
    username.value = profile.username || ''
    full_name.value = profile.full_name || ''
    bio.value = profile.bio || ''
  }
}

async function handleSave() {
  loadingProfile.value = true
  try {
    const s = await getSession()
    const userId = s?.user?.id
    await upsertProfile({ id: userId, username: username.value, full_name: full_name.value, bio: bio.value })
    showToast('Perfil actualizado correctamente ✅', 'success')
  } finally {
    loadingProfile.value = false
  }
}

async function handlePasswordChange() {
  if (newPassword.value.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres.', 'error')
    return
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword.value })
  if (error) showToast('Error al cambiar la contraseña.', 'error')
  else showToast('Contraseña actualizada con éxito 🔒', 'success')
}

onMounted(loadProfile)
</script>

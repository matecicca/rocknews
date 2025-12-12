<template>
  <section
    class="relative min-h-[100dvh] w-full flex items-center justify-center bg-gray-900 overflow-hidden px-4"
    aria-labelledby="titulo-auth"
  >
    <RouterLink
      to="/"
      class="absolute top-4 right-4 bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-700 shadow hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 transition"
    >
      ← Ir a Home
    </RouterLink>

    <div
      class="w-full max-w-md bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 text-white"
      role="form"
      aria-describedby="auth-description"
    >
      <h1 id="titulo-auth" class="text-3xl font-semibold text-center mb-2">
        RockNews
      </h1>
      <p id="auth-description" class="text-sm text-center text-gray-400 mb-6">
        Ingresá o creá una cuenta para continuar
      </p>

      <div class="flex mb-4 border-b border-gray-700">
        <button
          type="button"
          class="flex-1 py-2 text-center font-medium transition-colors"
          :class="mode === 'login'
            ? 'text-white border-b-2 border-gray-500'
            : 'text-gray-500 hover:text-gray-300'"
          @click="mode = 'login'"
        >
          Ingresar
        </button>
        <button
          type="button"
          class="flex-1 py-2 text-center font-medium transition-colors"
          :class="mode === 'register'
            ? 'text-white border-b-2 border-gray-500'
            : 'text-gray-500 hover:text-gray-300'"
          @click="mode = 'register'"
        >
          Registrarse
        </button>
      </div>

      <form @submit.prevent="handleSubmit" novalidate class="flex flex-col gap-4">
        <div>
          <label for="email" class="block text-sm text-gray-400">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            class="w-full mt-1 rounded-md bg-gray-900 border border-gray-700 text-white px-3 py-2 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 placeholder-gray-500"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm text-gray-400">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            v-model="password"
            minlength="6"
            required
            class="w-full mt-1 rounded-md bg-gray-900 border border-gray-700 text-white px-3 py-2 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 placeholder-gray-500"
            placeholder="mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gray-700 text-white font-medium py-2 px-4 rounded-md border border-gray-600 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:outline-none transition disabled:opacity-50"
        >
          <Loader v-if="loading" size="xs" inline />
          <span v-else>{{ mode === 'login' ? 'Ingresar' : 'Registrarse' }}</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { signIn, signUp } from '@/services/authService'
import { upsertProfile } from '@/services/profileService'
import Loader from '@/components/Loader.vue'

const router = useRouter()
const route = useRoute()
const showToast = inject('showToast', () => {})

const mode = ref('login')
const email = ref('')
const password = ref('')
const loading = ref(false)

function validateForm() {
  if (!email.value) {
    showToast('El correo electrónico es obligatorio.', 'error')
    return false
  }
  if (!password.value || password.value.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres.', 'error')
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validateForm()) return
  loading.value = true

  try {
    if (mode.value === 'register') {
      const { data, error } = await signUp(email.value, password.value)
      if (error) throw error

      const user = data.user
      if (user) {
        await upsertProfile({
          id: user.id,
          username: email.value.split('@')[0],
          full_name: '',
          bio: '',
        })
      }

      showToast('Cuenta creada con éxito 🎉', 'success')
    } else {
      const { error } = await signIn(email.value, password.value)
      if (error) throw error
      showToast('Sesión iniciada correctamente 👋', 'success')
    }

    const redirectTo = route.query.redirect || '/feed'
    router.push(redirectTo)
  } catch (err) {
    console.error(err)
    showToast(
      err?.message || 'Ocurrió un error. Verificá tus datos e intentá nuevamente.',
      'error'
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-900 text-white">
    <!-- HEADER (oculto en Auth) -->
    <header
      v-if="!isAuth"
      class="bg-black border-b border-gray-800 shadow-sm"
    >
      <nav
        class="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0"
      >
        <!-- LOGO -->
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

        <!-- NAVEGACIÓN + ACCIONES DE USUARIO -->
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Links Feed y Comunidad -->
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

          <!-- Botón Mi perfil -->
          <RouterLink
            v-if="isLoggedIn"
            to="/me"
            class="btn btn-ghost btn-nowrap"
          >
            Mi perfil
          </RouterLink>

          <!-- Botón Ingresar o Cerrar sesión -->
          <RouterLink
            v-if="!isLoggedIn"
            to="/auth"
            class="btn btn-primary btn-nowrap"
          >
            Ingresar
          </RouterLink>

          <button
            v-else
            @click="logout"
            class="btn btn-primary btn-nowrap"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
    </header>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="flex-1 text-white">
      <slot />
    </main>

    <!-- FOOTER (oculto en Auth) -->
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { session, signOut } = useAuth()

const isLoggedIn = computed(() => !!session.value)
const isAuth = computed(() => route.name === 'Auth')

async function logout() {
  await signOut()
  router.push('/auth')
}
</script>

<template>
  <section
    class="flex flex-col items-center justify-center text-center min-h-[calc(100vh-160px)] px-4 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden"
  >
    <div class="max-w-3xl space-y-6 z-10">
      <h1 class="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
        Bienvenido a <span class="text-gray-400">Rocknews</span>
      </h1>

      <p class="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Descubrí, compartí y comentá las últimas novedades del mundo rockero.
        Unite a la comunidad y hacé oír tu voz 🎸
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mt-10">
        <RouterLink
          to="/feed"
          class="btn btn-primary btn-nowrap text-lg py-3 shadow-lg transition"
        >
          Ir al Feed
        </RouterLink>

        <RouterLink
          v-if="isLoggedIn"
          to="/community"
          class="btn btn-primary btn-nowrap text-lg py-3 shadow-lg transition"
        >
          Ver Comunidad
        </RouterLink>

        <RouterLink
          v-else
          to="/auth"
          class="btn btn-primary btn-nowrap text-lg py-3 shadow-lg transition"
        >
          Ingresar o Registrarse
        </RouterLink>
      </div>
    </div>

    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="i in 6"
        :key="i"
        class="absolute bg-gray-500/20 rounded-full blur-3xl animate-pulse"
        :style="{
          width: `${50 + i * 40}px`,
          height: `${50 + i * 40}px`,
          top: `${Math.random() * 80}%`,
          left: `${Math.random() * 80}%`
        }"
      ></div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { session } = useAuth()
const isLoggedIn = computed(() => !!session.value)
</script>

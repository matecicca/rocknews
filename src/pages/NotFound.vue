<template>
  <section
    class="flex flex-col items-center justify-center text-center min-h-[calc(100vh-160px)] px-4 bg-gradient-to-b from-gray-900 to-gray-800"
  >
    <div class="max-w-3xl space-y-6">
      <h1 class="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
        Error <span class="text-gray-400">404</span>
      </h1>

      <p class="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Ups... parece que este escenario no existe en el tour.  
        Pero podés volver al inicio y seguir rockeando 🤘
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mt-10">
        <RouterLink
          to="/"
          class="btn btn-primary btn-nowrap text-lg py-3 shadow-lg hover:bg-gray-700 transition"
        >
          Volver al Inicio
        </RouterLink>

        <RouterLink
          to="/feed"
          class="btn btn-ghost btn-nowrap text-lg py-3 shadow-lg hover:bg-gray-700 transition"
        >
          Ir al Feed
        </RouterLink>
      </div>
    </div>

    <div class="mt-16 opacity-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 1440 320"
        class="w-full h-40"
      >
        <path
          fill="#ffffff"
          fill-opacity="0.1"
          d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,250.7C960,235,1056,181,1152,181.3C1248,181,1344,235,1392,261.3L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

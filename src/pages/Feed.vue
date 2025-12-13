<template>
  <section class="max-w-7xl mx-auto px-4 py-10 text-white space-y-6">
    <!-- PostComposer solo para usuarios autenticados que no sean admin -->
    <div v-if="canPost" class="bg-gray-800 rounded-xl shadow-md p-4 border border-gray-700">
      <h3 class="text-lg font-semibold text-white mb-3">
        ¿Qué estás pensando?
      </h3>

      <PostComposer
        class="flex flex-col gap-4"
      />
    </div>

    <!-- Mensaje para usuarios no autenticados -->
    <div v-else-if="!isLoggedIn" class="bg-gray-800 rounded-xl shadow-md p-4 border border-gray-700 text-center">
      <p class="text-gray-400">Para publicar, inicia sesión.</p>
    </div>

    <!-- Control de orden de publicaciones -->
    <div class="flex items-center justify-end">
      <button
        type="button"
        @click="toggleSortOrder"
        class="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-800"
        :title="sortAscending ? 'Ordenar por más nuevas primero' : 'Ordenar por más antiguas primero'"
      >
        <span>{{ sortAscending ? '↑' : '↓' }}</span>
        <span class="hidden sm:inline">{{ sortAscending ? 'Más antiguas primero' : 'Más nuevas primero' }}</span>
      </button>
    </div>

    <Loader v-if="loading" size="md" text="Cargando publicaciones..." />

    <div
      v-else-if="error"
      class="text-center text-red-400 bg-gray-800 border border-red-700 p-8 rounded-xl max-w-2xl mx-auto"
    >
      <p class="text-lg">Error al cargar el feed</p>
      <p class="text-sm mt-2">{{ error }}</p>
      <button @click="fetchFirstPage" class="btn btn-primary mt-4">Reintentar</button>
    </div>

    <div
      v-else-if="posts.length === 0"
      class="text-center text-gray-400 bg-gray-800 border border-gray-700 p-8 rounded-xl max-w-2xl mx-auto"
    >
      <p class="text-lg">Aún no hay publicaciones</p>
      <p class="text-sm mt-2">Sé el primero en compartir algo</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PostCard
        v-for="p in posts"
        :key="p.id"
        :post="p"
        @deleted="handleDeleted"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import PostCard from '@/components/PostCard.vue'
import PostComposer from '@/components/PostComposer.vue'
import Loader from '@/components/Loader.vue'
import { useFeed } from '@/composables/useFeed'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'

const { posts, loading, error, sortAscending, fetchFirstPage, toggleSortOrder } = useFeed()
const { isAdmin } = useAdmin()
const { session } = useAuth()

const isLoggedIn = computed(() => !!session.value)
const canPost = computed(() => isLoggedIn.value && !isAdmin.value)

function handleDeleted(postId) {
  const index = posts.value.findIndex(p => p.id === postId)
  if (index !== -1) {
    posts.value.splice(index, 1)
  }
}

onMounted(fetchFirstPage)
</script>

<style scoped>
section {
  scroll-behavior: smooth;
}
</style>

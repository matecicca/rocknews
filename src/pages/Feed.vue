<template>
  <section
    class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 max-w-6xl mx-auto px-4 py-10 text-white"
  >
    <!-- Publicaciones -->
    <div class="space-y-4">
      <div
        v-if="loading"
        class="text-center text-gray-400 bg-gray-800 border border-gray-700 p-4 rounded-xl"
      >
        Cargando publicaciones...
      </div>

      <template v-else>
        <PostCard v-for="p in posts" :key="p.id" :post="p" />
      </template>
    </div>

    <!-- PostComposer -->
    <aside class="space-y-4">
      <div
        class="bg-gray-800 rounded-xl shadow-md p-6 sticky top-6 border border-gray-700"
      >
        <h3 class="text-xl font-semibold text-white mb-4">
          ¿Qué estás pensando?
        </h3>

        <PostComposer
          @created="prepend"
          class="flex flex-col gap-4"
        />
      </div>
    </aside>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import PostCard from '@/components/PostCard.vue'
import PostComposer from '@/components/PostComposer.vue'
import { useFeed } from '@/composables/useFeed'

const { posts, loading, fetchFirstPage, prepend } = useFeed()
onMounted(fetchFirstPage)
</script>

<style scoped>
section {
  scroll-behavior: smooth;
}
</style>

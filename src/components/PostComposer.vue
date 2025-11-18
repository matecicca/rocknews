<template>
  <form
    @submit.prevent="submit"
    class="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm space-y-4 text-white"
  >
    <!-- Campo de texto -->
    <textarea
      v-model="content"
      class="textarea bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:ring-gray-600 focus:border-gray-600 min-h-[160px]"
      placeholder="Escribe lo que quieras..."
    ></textarea>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div class="text-xs text-gray-400">
        Se publicará como: <strong class="text-gray-200">{{ displayName }}</strong>
      </div>

      <button
        class="btn btn-primary btn-nowrap"
        :disabled="submitting || !content.trim()"
      >
        {{ submitting ? 'Publicando...' : 'Publicar' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { createPost } from '@/services/postService'
import { useAuth } from '@/composables/useAuth'

const showToast = inject('showToast', () => {})
const { session } = useAuth()

const content = ref('')
const submitting = ref(false)

const displayName = computed(() => {
  const user = session.value?.user
  return user?.user_metadata?.username || user?.email || 'Anónimo'
})

const emit = defineEmits(['created'])

async function submit() {
  if (!content.value.trim()) return

  try {
    submitting.value = true
    const post = await createPost({ content: content.value })
    content.value = ''
    emit('created', post)
    showToast('¡Publicado!', 'success')
  } catch (err) {
    console.error(err)
    showToast('No se pudo publicar', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

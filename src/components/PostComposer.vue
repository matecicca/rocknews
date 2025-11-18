<template>
  <form
    @submit.prevent="submit"
    class="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm space-y-4 text-white"
  >
    <!-- Campo de texto -->
    <div>
      <label for="post-content" class="sr-only">Contenido de la publicación</label>
      <textarea
        id="post-content"
        v-model="content"
        class="textarea bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:ring-gray-600 focus:border-gray-600 min-h-[160px]"
        placeholder="Escribe lo que quieras..."
      ></textarea>
    </div>

    <!-- Vista previa de imagen -->
    <div v-if="imagePreview" class="relative">
      <img :src="imagePreview" alt="Preview" class="max-h-60 rounded-lg" />
      <button
        type="button"
        @click="removeImage"
        class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 text-xs"
      >
        ✕
      </button>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <label for="post-image" class="cursor-pointer text-gray-400 hover:text-white transition">
          <span class="text-xl">📷</span>
          <input
            id="post-image"
            type="file"
            accept="image/*"
            @change="handleImageChange"
            class="sr-only"
          />
        </label>
        <div class="text-xs text-gray-400">
          Como: <strong class="text-gray-200">{{ displayName }}</strong>
        </div>
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
import { createPost, uploadPostImage } from '@/services/postService'
import { useAuth } from '@/composables/useAuth'

const showToast = inject('showToast', () => {})
const { session } = useAuth()

const content = ref('')
const submitting = ref(false)
const imageFile = ref(null)
const imagePreview = ref(null)

const displayName = computed(() => {
  const user = session.value?.user
  return user?.user_metadata?.username || user?.email || 'Anónimo'
})

const emit = defineEmits(['created'])

function handleImageChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = null
}

async function submit() {
  if (!content.value.trim()) return

  try {
    submitting.value = true

    let imagePath = null
    if (imageFile.value) {
      const userId = session.value?.user?.id
      imagePath = await uploadPostImage(imageFile.value, userId)
    }

    const post = await createPost({ content: content.value, image_path: imagePath })

    content.value = ''
    removeImage()
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

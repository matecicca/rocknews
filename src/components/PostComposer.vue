<template>
  <form
    @submit.prevent="submit"
    class="space-y-4 text-white"
  >
    <div>
      <label for="post-image" class="cursor-pointer text-gray-400 hover:text-white transition">
        <span class="text-sm">Agregar una imagen</span>
        <input
          id="post-image"
          type="file"
          accept="image/*"
          @change="handleImageChange"
          class="sr-only"
        />
      </label>
    </div>

    <div>
      <label for="post-content" class="sr-only">Contenido de la publicación</label>
      <textarea
        id="post-content"
        v-model="content"
        class="textarea bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:ring-gray-600 focus:border-gray-600 min-h-[80px]"
        :class="{ 'border-red-500': errorMessage }"
        placeholder="Escribe lo que quieras..."
        :maxlength="MAX_CONTENT_LENGTH"
      ></textarea>
      <div class="flex justify-between items-center mt-1">
        <p v-if="errorMessage" class="text-red-400 text-xs">{{ errorMessage }}</p>
        <span v-else></span>
        <span class="text-xs text-gray-500">{{ content.length }}/{{ MAX_CONTENT_LENGTH }}</span>
      </div>
    </div>

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

    <div class="flex items-center justify-end">
      <button
        class="btn btn-primary btn-nowrap"
        :disabled="submitting || !content.trim()"
      >
        <Loader v-if="submitting" size="xs" inline />
        <span v-else>Publicar</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, inject } from 'vue'
import { createPost, uploadPostImage } from '@/services/postService'
import { useAuth } from '@/composables/useAuth'
import Loader from '@/components/Loader.vue'

const showToast = inject('showToast', () => {})
const { session } = useAuth()

const content = ref('')
const submitting = ref(false)
const imageFile = ref(null)
const imagePreview = ref(null)
const errorMessage = ref('')

const MAX_CONTENT_LENGTH = 2000

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

/**
 * Valida el contenido del post
 * @returns {boolean} true si es válido
 */
function validateContent() {
  errorMessage.value = ''

  if (!content.value.trim()) {
    errorMessage.value = 'El contenido no puede estar vacío'
    return false
  }

  if (content.value.length > MAX_CONTENT_LENGTH) {
    errorMessage.value = `El contenido no puede exceder ${MAX_CONTENT_LENGTH} caracteres`
    return false
  }

  return true
}

async function submit() {
  if (!validateContent()) {
    showToast(errorMessage.value, 'error')
    return
  }

  try {
    submitting.value = true
    errorMessage.value = ''

    let imagePath = null
    if (imageFile.value) {
      const userId = session.value?.user?.id
      imagePath = await uploadPostImage(imageFile.value, userId)
    }

    const post = await createPost({ content: content.value.trim(), image_path: imagePath })

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

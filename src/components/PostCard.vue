<template>
  <article
    class="p-4 rounded-lg border border-gray-700/40 bg-gray-800/50 transition hover:border-gray-500/60 space-y-3"
  >
    <header class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <RouterLink
          v-if="post.profiles?.id"
          :to="getProfileLink(post.profiles.id)"
          class="flex-shrink-0"
        >
          <div class="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="post.profiles?.username"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-gray-300 font-semibold">
              {{ (post.profiles?.username || 'U').charAt(0).toUpperCase() }}
            </span>
          </div>
        </RouterLink>

        <div class="text-sm">
          <h3 class="text-base font-medium text-white m-0">
            <RouterLink
              v-if="post.profiles?.id"
              :to="getProfileLink(post.profiles.id)"
              class="hover:text-gray-300 hover:underline"
            >
              {{ post.profiles?.username || 'usuario' }}
            </RouterLink>
          </h3>
          <div class="text-gray-400 text-xs">
            <time :datetime="post.created_at">{{ formattedDate }}</time>
          </div>
        </div>
      </div>

      <div v-if="isOwnPost" class="flex gap-2">
        <button
          v-if="!editing"
          type="button"
          @click="startEdit"
          class="text-gray-400 hover:text-blue-400 text-sm px-2 py-1 cursor-pointer"
          title="Editar"
        >
          ✏️
        </button>
        <button
          type="button"
          @click="handleDelete"
          class="text-gray-400 hover:text-red-400 text-sm px-2 py-1 cursor-pointer"
          title="Eliminar"
        >
          🗑️
        </button>
      </div>
    </header>

    <form v-if="editing" class="space-y-2" @submit.prevent="saveEdit">
      <label for="edit-post-content" class="sr-only">Editar contenido de la publicación</label>
      <textarea
        id="edit-post-content"
        v-model="editedContent"
        class="textarea bg-gray-900 border-gray-700 text-white w-full"
        rows="3"
      ></textarea>
      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary btn-sm">Guardar</button>
        <button type="button" @click="cancelEdit" class="btn btn-ghost btn-sm">Cancelar</button>
      </div>
    </form>
    <p v-else class="whitespace-pre-wrap text-gray-200">{{ post.content }}</p>

    <div v-if="post.image_path" class="mt-3">
      <img
        :src="getImageUrl(post.image_path)"
        :alt="'Imagen de ' + (post.profiles?.username || 'usuario')"
        class="rounded-lg max-h-96 w-full object-cover"
      />
    </div>

    <div class="mt-4 pt-4 border-t border-gray-700/50 space-y-3">
      <button
        type="button"
        @click="toggleComments"
        class="text-sm text-gray-400 hover:text-white transition cursor-pointer"
      >
        {{ showComments ? '▼' : '▶' }} Comentarios ({{ commentCount }})
      </button>

      <div v-if="showComments" class="space-y-3">
        <div v-if="comments.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="bg-gray-900/50 rounded p-2 text-sm"
          >
            <div class="flex items-start gap-2">
              <div class="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <img
                  v-if="getAvatarUrl(comment.profiles?.avatar_path)"
                  :src="getAvatarUrl(comment.profiles?.avatar_path)"
                  :alt="comment.profiles?.username"
                  class="w-full h-full object-cover rounded-full"
                />
                <span v-else class="text-xs text-gray-300">
                  {{ (comment.profiles?.username || 'U').charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <span class="font-medium text-gray-300">{{ comment.profiles?.username || 'Anónimo' }}</span>
                <p class="text-gray-400 break-words">{{ comment.content }}</p>
                <span class="text-xs text-gray-500">{{ formatCommentDate(comment.created_at) }}</span>
              </div>
              <button
                v-if="isOwnComment(comment)"
                type="button"
                @click="deleteCommentHandler(comment.id)"
                class="text-gray-500 hover:text-red-400 text-xs cursor-pointer"
                title="Eliminar comentario"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <form @submit.prevent="addComment" class="flex gap-2">
          <label for="comment-input" class="sr-only">Escribe un comentario</label>
          <input
            id="comment-input"
            v-model="newComment"
            type="text"
            placeholder="Escribe un comentario..."
            class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
          <button
            type="submit"
            :disabled="!newComment.trim()"
            class="btn btn-primary btn-sm"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>

    <ConfirmDialog
      :is-open="confirmDialogOpen"
      :title="confirmDialogData.title"
      :message="confirmDialogData.message"
      :preview="confirmDialogData.preview"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </article>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { updatePost, deletePost, getPostImageUrl, deletePostImage } from '@/services/postService'
import { getAvatarUrl } from '@/services/profileService'
import { listComments, createComment, deleteComment, getCommentsCount, subscribeToComments } from '@/services/commentService'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps({
  post: { type: Object, required: true }
})

const emit = defineEmits(['deleted', 'updated'])

const { session } = useAuth()
const showToast = inject('showToast', () => {})

const editing = ref(false)
const editedContent = ref('')
const showComments = ref(false)
const comments = ref([])
const commentCount = ref(0)
const newComment = ref('')
let unsubscribe = null

// Estados del modal de confirmación
const confirmDialogOpen = ref(false)
const confirmDialogData = ref({
  title: '',
  message: '',
  preview: '',
  onConfirm: null
})

const isOwnPost = computed(() => {
  return session.value?.user?.id === props.post.author_id
})

const avatarUrl = computed(() => {
  return getAvatarUrl(props.post.profiles?.avatar_path)
})

function getProfileLink(authorId) {
  const currentUserId = session.value?.user?.id
  return currentUserId === authorId ? '/me' : `/profile/${authorId}`
}

const formattedDate = computed(() => {
  const date = new Date(props.post.created_at)
  return date.toLocaleString()
})

function formatCommentDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString()
}

function getImageUrl(path) {
  return getPostImageUrl(path)
}

function isOwnComment(comment) {
  return session.value?.user?.id === comment.author_id
}

function startEdit() {
  editing.value = true
  editedContent.value = props.post.content
}

function cancelEdit() {
  editing.value = false
  editedContent.value = ''
}

async function saveEdit() {
  try {
    const updated = await updatePost(props.post.id, { content: editedContent.value })
    Object.assign(props.post, updated)
    editing.value = false
    emit('updated', updated)
    showToast('Post actualizado', 'success')
  } catch (err) {
    console.error(err)
    showToast('Error al actualizar', 'error')
  }
}

function handleDelete() {
  const preview = props.post.content.substring(0, 50) + (props.post.content.length > 50 ? '...' : '')

  confirmDialogData.value = {
    title: '¿Eliminar esta publicación?',
    message: 'Se eliminará permanentemente esta publicación.',
    preview: preview,
    onConfirm: async () => {
      try {
        // Limpiar imagen de Supabase Storage antes de eliminar el registro
        if (props.post.image_path) {
          await deletePostImage(props.post.image_path)
        }

        await deletePost(props.post.id)
        emit('deleted', props.post.id)
        showToast('Post eliminado', 'success')
      } catch (err) {
        console.error(err)
        showToast(`Error al eliminar la publicación: ${err.message || 'Por favor intenta nuevamente'}`, 'error')
      }
    }
  }

  confirmDialogOpen.value = true
}

// Comments functionality
async function toggleComments() {
  showComments.value = !showComments.value
  if (showComments.value && comments.value.length === 0) {
    await loadComments()
  }
}

async function loadComments() {
  comments.value = await listComments(props.post.id)
  commentCount.value = comments.value.length
}

async function loadCommentCount() {
  commentCount.value = await getCommentsCount(props.post.id)
}

function subscribeToCommentsRealtime() {
  unsubscribe = subscribeToComments(props.post.id, (comment, eventType) => {
    if (eventType === 'INSERT') {
      // Verificar si el comentario ya existe para evitar duplicados
      const exists = comments.value.some(c => c.id === comment.id)
      if (!exists) {
        comments.value.push(comment)
        commentCount.value++
      }
    } else if (eventType === 'DELETE') {
      // Solo decrementar si el comentario existía
      const lengthBefore = comments.value.length
      comments.value = comments.value.filter(c => c.id !== comment.id)
      if (comments.value.length < lengthBefore) {
        commentCount.value--
      }
    } else if (eventType === 'UPDATE') {
      const index = comments.value.findIndex(c => c.id === comment.id)
      if (index !== -1) comments.value[index] = comment
    }
  })
}

async function addComment() {
  if (!newComment.value.trim()) return
  try {
    const comment = await createComment({ post_id: props.post.id, content: newComment.value })

    // Agregar el comentario inmediatamente al array local
    comments.value.push(comment)
    commentCount.value++

    newComment.value = ''
  } catch (err) {
    console.error(err)
    showToast('Error al comentar', 'error')
  }
}

function deleteCommentHandler(commentId) {
  const comment = comments.value.find(c => c.id === commentId)
  if (!comment) return

  const preview = comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '')

  confirmDialogData.value = {
    title: '¿Eliminar este comentario?',
    message: 'Se eliminará permanentemente este comentario.',
    preview: preview,
    onConfirm: async () => {
      try {
        await deleteComment(commentId)

        // Eliminar el comentario inmediatamente del array local
        comments.value = comments.value.filter(c => c.id !== commentId)
        commentCount.value--
        showToast('Comentario eliminado', 'success')
      } catch (err) {
        console.error(err)
        showToast('Error al eliminar comentario', 'error')
      }
    }
  }

  confirmDialogOpen.value = true
}

async function handleConfirm() {
  if (confirmDialogData.value.onConfirm) {
    await confirmDialogData.value.onConfirm()
  }
  confirmDialogOpen.value = false
}

function handleCancel() {
  confirmDialogOpen.value = false
}

onMounted(() => {
  loadCommentCount()
  subscribeToCommentsRealtime()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

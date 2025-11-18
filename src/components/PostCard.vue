<template>
  <article
    class="p-3 rounded-lg border border-gray-700/40 bg-transparent transition hover:border-gray-500/60"
  >
    <header class="flex items-center justify-between">
      <div class="text-sm text-gray-400">
        <RouterLink
          v-if="post.profiles?.id"
          :to="getProfileLink(post.profiles.id)"
          class="font-medium text-white hover:text-gray-300 hover:underline-offset-4"
        >
          {{ post.profiles?.username || 'usuario' }}
        </RouterLink>
        <span> · </span>
        <time :datetime="post.created_at">{{ formattedDate }}</time>
      </div>
      <div class="text-xs font-semibold text-white">#{{ post.id }}</div>
    </header>

    <p class="whitespace-pre-wrap text-gray-200 mt-2">{{ post.content }}</p>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
  post: { type: Object, required: true }
})

const { session } = useAuth()

function getProfileLink(authorId) {
  const currentUserId = session.value?.user?.id
  return currentUserId === authorId ? '/me' : `/profile/${authorId}`
}

const formattedDate = computed(() => {
  const date = new Date(props.post.created_at)
  return date.toLocaleString()
})
</script>

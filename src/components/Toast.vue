<template>
  <transition name="fade">
    <div v-if="message" class="toast" :class="toastClass">
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'info' }
})

const toastClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'toast-success'
    case 'error':
      return 'toast-error'
    case 'warning':
      return 'toast-warning'
    default:
      return 'toast-info'
  }
})
</script>

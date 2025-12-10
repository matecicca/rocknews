<template>
  <transition name="fade">
    <div v-if="message" class="toast" :class="toastClass">
      <span>{{ message }}</span>
      <button
        type="button"
        @click="$emit('close')"
        class="ml-3 text-white hover:text-gray-300 font-bold"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'info' }
})

defineEmits(['close'])

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

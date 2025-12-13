<template>
  <transition name="modal-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="cancel"
    >
      <div
        class="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full p-6 text-white transform transition-all"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <h3
          :id="titleId"
          class="text-xl font-semibold text-white mb-3"
        >
          {{ title }}
        </h3>

        <div class="text-gray-300 mb-2">
          {{ message }}
        </div>

        <div
          v-if="preview"
          class="bg-gray-900 border border-gray-700 rounded-lg p-3 my-4 text-sm text-gray-400 italic"
        >
          "{{ preview }}"
        </div>

        <p class="text-red-400 text-sm mb-6">
          Esta acción no se puede deshacer.
        </p>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="cancel"
            class="btn btn-admin-cancel px-4 py-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirm"
            class="btn btn-ghost px-4 py-2"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: '¿Estás seguro?' },
  message: { type: String, default: '' },
  preview: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

const titleId = computed(() => `confirm-dialog-${Math.random().toString(36).substr(2, 9)}`)

function confirm() {
  emit('confirm')
}

function cancel() {
  emit('cancel')
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .bg-gray-800,
.modal-fade-leave-active .bg-gray-800 {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from .bg-gray-800,
.modal-fade-leave-to .bg-gray-800 {
  transform: scale(0.9);
  opacity: 0;
}
</style>

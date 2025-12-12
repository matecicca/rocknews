<template>
  <div>
    <!-- Banner de modo administrador -->
    <div v-if="isAdmin" class="admin-banner">
      Modo Administrador
    </div>

    <component :is="layoutComponent">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>

      <Toast :message="toastMessage" :type="toastType" @close="closeToast" />
    </component>
  </div>
</template>

<script setup>
import { computed, ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import Toast from './components/Toast.vue'
import { useAdmin } from '@/composables/useAdmin'

const route = useRoute()
const layoutComponent = computed(() => AppLayout)

// Estado de administrador
const { isAdmin } = useAdmin()

// Sistema global de notificaciones
const toastMessage = ref('')
const toastType = ref('info')
const toastTimeoutId = ref(null)

function showToast(message, type = 'info', duration = 0) {
  // Limpiar timeout anterior si existe
  if (toastTimeoutId.value) {
    clearTimeout(toastTimeoutId.value)
    toastTimeoutId.value = null
  }

  toastMessage.value = message
  toastType.value = type

  // Configurar auto-cierre solo si duration es mayor a 0
  if (duration > 0) {
    toastTimeoutId.value = setTimeout(() => {
      toastMessage.value = ''
      toastTimeoutId.value = null
    }, duration)
  }
}

function closeToast() {
  if (toastTimeoutId.value) {
    clearTimeout(toastTimeoutId.value)
    toastTimeoutId.value = null
  }
  toastMessage.value = ''
}

provide('showToast', showToast)
provide('closeToast', closeToast)
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

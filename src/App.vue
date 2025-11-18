<template>
  <component :is="layoutComponent">
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>

    <!-- Toast global -->
    <Toast :message="toastMessage" :type="toastType" />
  </component>
</template>

<script setup>
import { computed, ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import Toast from './components/Toast.vue'

const route = useRoute()
const layoutComponent = computed(() => AppLayout)

// Sistema global de notificaciones
const toastMessage = ref('')
const toastType = ref('info')

function showToast(message, type = 'info') {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => (toastMessage.value = ''), 2500)
}

provide('showToast', showToast)
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

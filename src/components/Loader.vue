<template>
  <div class="loader-container" :class="containerClass">
    <span class="loader" :style="loaderStyle"></span>
    <span v-if="text" class="loader-text">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  inline: {
    type: Boolean,
    default: false
  }
})

const sizes = {
  xs: { width: '16px', height: '16px', border: '2px', after: '20px' },
  sm: { width: '24px', height: '24px', border: '2px', after: '30px' },
  md: { width: '48px', height: '48px', border: '3px', after: '56px' },
  lg: { width: '64px', height: '64px', border: '4px', after: '72px' }
}

const loaderStyle = computed(() => {
  const s = sizes[props.size]
  return {
    '--loader-width': s.width,
    '--loader-height': s.height,
    '--loader-border': s.border,
    '--loader-after-size': s.after
  }
})

const containerClass = computed(() => ({
  'loader-inline': props.inline,
  'loader-block': !props.inline
}))
</script>

<style scoped>
.loader-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.loader-container.loader-inline {
  display: inline-flex;
}

.loader-container.loader-block {
  width: 100%;
  padding: 2rem 0;
}

.loader {
  width: var(--loader-width);
  height: var(--loader-height);
  border: var(--loader-border) solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  flex-shrink: 0;
}

.loader::after {
  content: '';
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--loader-after-size);
  height: var(--loader-after-size);
  border-radius: 50%;
  border: var(--loader-border) solid transparent;
  border-bottom-color: #19B7E3;
}

.loader-text {
  color: #9CA3AF;
  font-size: 0.875rem;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

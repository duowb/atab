<script setup lang="ts">
import { isDark, toggleDark } from '../../composables/useDark'
</script>

<template>
  <button class="w-full" @click="toggleDark">
    <span class="text-xl">{{ isDark ? "☀️" : "🌙" }}</span>
  </button>
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) {
  z-index: 1;
}
::view-transition-new(root) {
  z-index: 2147483646;
}
.dark::view-transition-old(root) {
  z-index: 2147483646;
}
.dark::view-transition-new(root) {
  z-index: 1;
}
</style>

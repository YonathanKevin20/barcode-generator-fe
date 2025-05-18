<script setup lang="ts">
import { version } from '~/package.json'
</script>

<template>
  <footer class="mt-auto border-t-2 border-default px-1.5 py-2.5 flex justify-between items-center">
    <span class="text-sm text-neutral-500">v{{ version }}</span>
    <DarkModeSwitcher />
  </footer>
</template>

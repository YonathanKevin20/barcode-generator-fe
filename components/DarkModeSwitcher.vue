<script setup lang="ts">
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    title="Toggle color mode"
    @click="toggleColorMode"
    class="flex items-center justify-center p-2 rounded-full transition-colors duration-200 ease-in-out bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 dark:focus:ring-neutral-600">
    <UIcon v-if="colorMode.preference === 'dark'" name="i-mdi-weather-night" class="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
    <UIcon v-else name="i-mdi-weather-sunny" class="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
  </button>
</template>

<style scoped>
button {
  transition: background-color 0.2s ease-in-out, transform 0.2s ease;
}

button:hover {
  transform: scale(1.05);
}

button:active {
  transform: scale(0.95);
}
</style>

<script setup lang="ts">
const items = [
  { label: '10 per page', value: 10 },
  { label: '20 per page', value: 20 },
  { label: '50 per page', value: 50 },
  { label: '100 per page', value: 100 }
]

const model = defineModel<number>()
</script>

<template>
  <USelect
    v-model="model"
    :items="items"
    class="w-32" />
</template>

<script setup lang="ts">
const items = [
  { label: '5 per page', value: 5 },
  { label: '10 per page', value: 10 },
  { label: '25 per page', value: 25 },
  { label: '50 per page', value: 50 }
]

const model = defineModel<number>()
</script>

<template>
  <USelect
    v-model="model"
    :items="items"
    class="w-32" />
</template>

<script setup lang="ts">
const props = defineProps<{
  showAll?: boolean
}>()

const items = [
  ...(props.showAll ? [{ label: 'ALL', id: 'all' }] : []),
  { label: 'admin', id: 'admin'},
  { label: 'operator', id: 'operator'}
]

const model = defineModel<string>()
</script>

<template>
  <USelectMenu
    v-model="model"
    placeholder="Search role..."
    :items="items"
    value-key="id"
    class="w-40" />
</template>

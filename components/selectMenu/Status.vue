<script setup lang="ts">
const props = defineProps<{
  showAll?: boolean
}>()

const $fetchWithToken = fetchWithToken()

const model = defineModel<number | string>()

const { data, status, refresh } = await useLazyAsyncData(
  `statuses-${props.showAll ? 'all' : 'filtered'}`,
  () => $fetchWithToken(`/api/statuses`),
  {
    default: () => [],
    transform: (data) => props.showAll
      ? [{ id: 0, name: 'ALL' }, ...data.data]
      : data.data
  }
)

onMounted(() => {
  if (model.value === 0) {
    model.value = ''
  }
})
</script>

<template>
  <USelectMenu
    v-model="model"
    placeholder="Search status..."
    :loading="status === 'pending'"
    :items="data"
    value-key="id"
    label-key="name"
    class="w-32" />
</template>

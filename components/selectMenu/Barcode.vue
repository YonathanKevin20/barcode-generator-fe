<script setup lang="ts">
const $fetchWithToken = fetchWithToken()

const model = defineModel<string>()

const { data, status, refresh } = await useLazyAsyncData('top-barcodes', () => $fetchWithToken(`/api/barcodes`), {
  default: () => [],
  transform: (data) => data.data
})
</script>

<template>
  <USelectMenu
    v-model="model"
    placeholder="Search..."
    :loading="status === 'pending'"
    :items="data"
    value-key="barcode"
    label-key="barcode"
    class="w-60" />
</template>

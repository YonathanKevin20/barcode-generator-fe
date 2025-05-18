<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { BarcodeCreate } from '~/schemas/BarcodeCreateSchema'
import { BarcodeCreateSchema } from '~/schemas/BarcodeCreateSchema'

useHead({
  title: 'Generate Barcode'
})
definePageMeta({
  middleware: ['sidebase-auth']
})

const $fetchWithToken = fetchWithToken()

const state = reactive({
  status_id: 0,
  category_id: 0,
  supplier_id: 0,
  product_name: '',
})
watch(() => state.product_name, (val) => {
  if (val !== val.toUpperCase()) {
    state.product_name = val.toUpperCase()
  }
})

const toast = useToast()

const pending = ref(false)
const onSubmit = async (event: FormSubmitEvent<BarcodeCreate>) => {
  pending.value = true

  try {
    const { data } = await $fetchWithToken('/api/barcodes', {
      method: 'POST',
      body: event.data
    })

    toast.add({ title: data.message })
    await navigateTo('/barcodes')
  } catch (error: any) {
    const message = error.data.error?.message || error.data.message
    toast.add({ title: message })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main>
    <h1 class="text-2xl font-bold">Generate Barcode</h1>

    <UForm :schema="BarcodeCreateSchema" :state="state" class="space-y-4 max-w-lg my-4" @submit="onSubmit">
      <UFormField label="Status" name="status_id">
        <SelectMenuStatus v-model="state.status_id" class="w-full" />
      </UFormField>
      <UFormField label="Category" name="category_id">
        <InfiniteLoadingCategory v-model="state.category_id" />
      </UFormField>
      <UFormField label="Supplier" name="supplier_id">
        <InfiniteLoadingSupplier v-model="state.supplier_id" />
      </UFormField>
      <UFormField label="Name of Product" name="product_name">
        <UInput v-model="state.product_name" class="w-full" />
      </UFormField>
      <UButton type="submit" label="Submit" :loading="pending" />
    </UForm>
  </main>
</template>

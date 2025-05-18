<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { SupplierCreate } from '~/schemas/SupplierCreateSchema'
import { SupplierCreateSchema } from '~/schemas/SupplierCreateSchema'

useHead({
  title: 'Create Supplier'
})
definePageMeta({
  middleware: ['sidebase-auth', 'admin']
})

const $fetchWithToken = fetchWithToken()

const state = reactive({
  code: '',
  name: '',
})

const toast = useToast()

const pending = ref(false)
const onSubmit = async (event: FormSubmitEvent<SupplierCreate>) => {
  pending.value = true

  try {
    const { data } = await $fetchWithToken('/api/suppliers', {
      method: 'POST',
      body: event.data
    })

    toast.add({ title: data.message })
    await navigateTo('/suppliers')
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
    <h1 class="text-2xl font-bold">Create Supplier</h1>

    <UForm :schema="SupplierCreateSchema" :state="state" class="space-y-4 max-w-lg my-4" @submit="onSubmit">
      <UFormField label="Code" name="code">
        <UInput v-model="state.code" class="w-full" />
      </UFormField>
      <UFormField label="Name of Supplier" name="name">
        <UInput v-model="state.name" class="w-full" />
      </UFormField>
      <UButton type="submit" label="Submit" :loading="pending" />
    </UForm>
  </main>
</template>

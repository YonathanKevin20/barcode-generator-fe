<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { SupplierEdit } from '~/schemas/SupplierEditSchema'
import { SupplierEditSchema } from '~/schemas/SupplierEditSchema'

useHead({
  title: 'Edit Supplier'
})
definePageMeta({
  middleware: ['sidebase-auth', 'admin']
})

const $fetchWithToken = fetchWithToken()

const state = reactive({
  code: '',
  name: '',
})

const route = useRoute()
const id = route.params.id
const initState = async () => {
  try {
    const { data } = await $fetchWithToken(`/api/suppliers/${id}`)

    if (data) {
      state.code = data.code
      state.name = data.name
    }
  } catch (error: any) {
    console.error(error)
  }
}

onMounted(() => {
  initState()
})

const toast = useToast()

const pending = ref(false)
const onSubmit = async (event: FormSubmitEvent<SupplierEdit>) => {
  pending.value = true

  try {
    const { data } = await $fetchWithToken(`/api/suppliers/${id}`, {
      method: 'PUT',
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
    <h1 class="text-2xl font-bold">Edit Supplier</h1>

    <UForm :schema="SupplierEditSchema" :state="state" class="space-y-4 max-w-lg my-4" @submit="onSubmit">
      <UFormField label="Code" name="code">
        <UInput :model-value="state.code" class="w-full" readonly />
      </UFormField>
      <UFormField label="Name of Supplier" name="name">
        <UInput v-model="state.name" class="w-full" />
      </UFormField>
      <UButton type="submit" label="Submit" :loading="pending" />
    </UForm>
  </main>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { CategoryEdit } from '~/schemas/CategoryEditSchema'
import { CategoryEditSchema } from '~/schemas/CategoryEditSchema'

useHead({
  title: 'Edit Category'
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
    const { data } = await $fetchWithToken(`/api/categories/${id}`)

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
const onSubmit = async (event: FormSubmitEvent<CategoryEdit>) => {
  pending.value = true

  try {
    const { data } = await $fetchWithToken(`/api/categories/${id}`, {
      method: 'PUT',
      body: event.data
    })

    toast.add({ title: data.message })
    await navigateTo('/categories')
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
    <h1 class="text-2xl font-bold">Edit Category</h1>

    <UForm :schema="CategoryEditSchema" :state="state" class="space-y-4 max-w-lg my-4" @submit="onSubmit">
      <UFormField label="Code" name="code">
        <UInput :model-value="state.code" class="w-full" readonly />
      </UFormField>
      <UFormField label="Name of Category" name="name">
        <UInput v-model="state.name" class="w-full" />
      </UFormField>
      <UButton type="submit" label="Submit" :loading="pending" />
    </UForm>
  </main>
</template>

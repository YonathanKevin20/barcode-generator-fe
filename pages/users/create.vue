<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { UserCreate } from '~/schemas/UserCreateSchema'
import { UserCreateSchema } from '~/schemas/UserCreateSchema'

useHead({
  title: 'Create User'
})
definePageMeta({
  middleware: ['sidebase-auth', 'admin']
})

const $fetchWithToken = fetchWithToken()

const state = reactive({
  username: '',
  password: '',
  role: 'user'
})
const hidePassword = ref(true)

const toast = useToast()

const pending = ref(false)
const onSubmit = async (event: FormSubmitEvent<UserCreate>) => {
  pending.value = true

  try {
    const { data } = await $fetchWithToken('/api/users', {
      method: 'POST',
      body: event.data
    })

    toast.add({ title: data.message })
    await navigateTo('/users')
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
    <h1 class="text-2xl font-bold">Create User</h1>

    <UForm :schema="UserCreateSchema" :state="state" class="space-y-4 max-w-lg my-4" @submit="onSubmit">
      <UFormField label="Username" name="username">
        <UInput v-model="state.username" class="w-full" />
      </UFormField>
      <UFormField label="Password" name="password">
        <UInput
          v-model="state.password"
          class="w-full"
          :type="hidePassword ? 'password' : 'text'"
          :ui="{ trailing: 'pe-1' }">
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="hidePassword ? 'i-mdi-eye' : 'i-mdi-eye-off'"
              :aria-label="hidePassword ? 'Hide password' : 'Show password'"
              :aria-pressed="hidePassword"
              aria-controls="password"
              @click="hidePassword = !hidePassword" />
          </template>
        </UInput>
      </UFormField>
      <UFormField label="Role" name="role">
        <SelectMenuRole v-model="state.role" class="w-full" />
      </UFormField>
      <UButton type="submit" label="Submit" :loading="pending" />
    </UForm>
  </main>
</template>

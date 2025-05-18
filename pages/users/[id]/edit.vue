<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { UserEdit } from '~/schemas/UserEditSchema'
import { UserEditSchema } from '~/schemas/UserEditSchema'

useHead({
  title: 'Edit User'
})
definePageMeta({
  middleware: ['sidebase-auth', 'admin']
})

const $fetchWithToken = fetchWithToken()
const { data: userData, getSession } = useAuth()

const isSelf = computed(() => userData.value?.data.id === +id)

const state = reactive({
  username: '',
  role: 'user',
  new_password: '',
})
const hidePassword = ref(true)

const route = useRoute()
const id = route.params.id
const initState = async () => {
  try {
    const { data } = await $fetchWithToken(`/api/users/${id}`)

    if (data) {
      state.username = data.username
      state.role = data.role
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
const onSubmit = async (event: FormSubmitEvent<UserEdit>) => {
  pending.value = true

  try {
    const { data } = await $fetchWithToken(`/api/users/${id}`, {
      method: 'PUT',
      body: event.data
    })

    toast.add({ title: data.message })
    isSelf.value && (await getSession())
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
    <h1 class="text-2xl font-bold">Edit User</h1>

    <UForm :schema="UserEditSchema" :state="state" class="space-y-4 max-w-lg my-4" @submit="onSubmit">
      <UFormField label="Username" name="username">
        <UInput v-model="state.username" class="w-full" />
      </UFormField>
      <UFormField label="Role" name="role">
        <SelectMenuRole v-model="state.role" class="w-full" />
      </UFormField>
      <UFormField label="New Password" name="new_password">
        <UInput
          v-model="state.new_password"
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
      <UButton type="submit" label="Submit" :loading="pending" />
    </UForm>
  </main>
</template>

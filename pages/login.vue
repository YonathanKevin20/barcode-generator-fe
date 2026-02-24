<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { Login } from '~/schemas/LoginSchema'
import { LoginSchema } from '~/schemas/LoginSchema'

useHead({
  title: 'Login'
})
definePageMeta({
  middleware: ['guest']
})

const state = reactive({
  username: '',
  password: ''
})
watchEffect(() => {
  if (state.username.length > 0 && state.password.length > 0) {
    errorMessage.value = ''
  }
})
const hidePassword = ref(true)
const errorMessage = ref('')
const pending = ref(false)

const route = useRoute()
const redirectUrl = computed(() => route.query.redirect as string || '/')
const { signIn } = useAuth()
const onSubmit = async (event: FormSubmitEvent<Login>) => {
  pending.value = true

  try {
    await signIn(event.data, { callbackUrl: redirectUrl.value })
  } catch (error: any) {
    const message = error.data.error?.message || error.data.message
    errorMessage.value = message
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main>
    <h1 class="text-2xl font-bold">Login</h1>

    <UForm :schema="LoginSchema" :state="state" class="space-y-4 max-w-lg my-4" @submit="onSubmit">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage" />
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
      <UButton type="submit" label="Submit" :loading="pending" />
    </UForm>
  </main>
</template>

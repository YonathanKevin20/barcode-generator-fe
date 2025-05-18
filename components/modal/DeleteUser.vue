<script setup lang="ts">
const props = defineProps<{
  id: number
}>()

const $fetchWithToken = fetchWithToken()

const toast = useToast()

const pending = ref(false)
const deleteItem = async () => {
  pending.value = true

  try {
    const { data } = await $fetchWithToken(`/api/users/${props.id}`, {
      method: 'DELETE',
      body: {}
    })

    toast.add({ title: data.message })
    emit('success')
    emit('close')
  } catch (error: any) {
    const message = error.data.error?.message || error.data.message
    toast.add({ title: message })
  } finally {
    pending.value = false
  }
}

const emit = defineEmits<{
  close: []
  success: []
}>()
</script>

<template>
  <UModal
    title="Delete User"
    description="This action cannot be undone."
    :ui="{ footer: 'justify-end' }">

    <template #body>
      <p>Are you sure you want to delete this user?</p>
    </template>

    <template #footer>
      <UButton
        label="Delete"
        variant="solid"
        color="error"
        :loading="pending"
        @click="deleteItem()" />
    </template>
  </UModal>
</template>

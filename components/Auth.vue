<script setup lang="ts">
const { data, signOut } = useAuth()
</script>

<template>
  <div class="ml-auto">
    <div v-if="data" class="space-x-2">
      <span class="text-sm">{{ data.data.username }}</span>
      <UButton
        @click="signOut({ callbackUrl: '/login' })"
        label="Logout"
        variant="link"
        color="neutral" />
    </div>
    <UButton
      v-else
      to="/login"
      label="Login"
      variant="link"
      color="neutral" />
  </div>
</template>

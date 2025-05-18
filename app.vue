<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Barcode Generator` : 'Barcode Generator'
  }
})

provideDropdownManager()
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <UContainer class="flex flex-col h-screen">
        <nav class="flex items-center my-4">
          <Menu />
          <Auth />
        </nav>
        <NuxtPage />
        <Footer />
      </UContainer>
    </NuxtLayout>
  </UApp>
</template>

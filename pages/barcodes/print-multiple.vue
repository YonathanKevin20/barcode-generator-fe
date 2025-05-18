<script setup lang="ts">
import JsBarcode from 'jsbarcode'

useHead({
  title: 'Print Multiple Barcodes'
})
definePageMeta({
  middleware: ['sidebase-auth']
})

const printArea = ref<HTMLElement | null>(null)
const selectedBarcode = ref('')
const amount = ref(1)

const printBarcodes = () => {
  nextTick(() => {
    for (let i = 1; i <= amount.value; i++) {
      JsBarcode(`#barcode-${i}`, selectedBarcode.value, {
        format: 'EAN13',
      })
    }
    print()
  })
}

const print = () => {
  document.documentElement.classList.remove('dark')
  const printContents = printArea.value?.innerHTML || ''
  const originalContents = document.body.innerHTML
  document.body.innerHTML = printContents
  window.print()
  document.body.innerHTML = originalContents
  document.documentElement.classList.add('dark')
  window.location.reload()
}
</script>

<template>
  <main>
    <h1 class="text-2xl font-bold">Print Multiple Barcodes</h1>

    <form @submit.prevent="printBarcodes">
      <div class="space-x-2">
        <label for="barcode">Select Barcode</label>
        <SelectMenuBarcode v-model="selectedBarcode" />
      </div>
      <div class="space-x-2">
        <label for="amount">Amount</label>
        <UInput
          type="number"
          v-model="amount"
          placeholder="Enter amount..."
          class="w-full md:w-48" />
      </div>
      <UButton type="submit" label="Print" />
    </form>
    <div ref="printArea" class="print-area">
      <div class="flex flex-wrap">
        <svg
          v-for="i in amount"
          :key="i"
          :id="'barcode-' + i"
          class="border border-black m-1"></svg>
      </div>
    </div>
  </main>
</template>

<style scoped>
.print-area {
  display: none;
}
@page {
  size: A4 portrait;
  margin: 0;
}
@media print {
  html, body {
    margin: 0;
    padding: 0;
    background: white !important;
    color-scheme: light !important;
  }
  .print-area {
    background: white !important;
    display: block;
  }
  form {
    display: none;
  }
}
</style>

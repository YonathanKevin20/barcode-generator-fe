<script setup lang="ts">
import JsBarcode from 'jsbarcode'

useHead({
  title: 'Print Multiple Barcodes'
})
definePageMeta({
  middleware: ['sidebase-auth']
})

const $fetchWithToken = fetchWithToken()

interface PrintEntry {
  id: number
  barcodeId: number | undefined
  barcode: string
  product_name: string
  price: number | null
  quantity: number
}

let entryIdCounter = 1
const entries = ref<PrintEntry[]>([
  { id: entryIdCounter++, barcodeId: undefined, barcode: '', product_name: '', price: null, quantity: 1 }
])

const addEntry = () => {
  entries.value.push({ id: entryIdCounter++, barcodeId: undefined, barcode: '', product_name: '', price: null, quantity: 1 })
}

const removeEntry = (index: number) => {
  if (entries.value.length > 1) {
    entries.value.splice(index, 1)
  }
}

const onBarcodeSelect = async (index: number, barcodeId: number) => {
  const entry = entries.value[index]
  if (!entry) return

  entry.barcodeId = barcodeId

  try {
    const { data } = await $fetchWithToken(`/api/barcodes/${barcodeId}`)
    if (data) {
      entry.barcode = data.barcode
      entry.product_name = data.product_name
    }
  } catch (error) {
    console.error('Error fetching barcode details:', error)
  }
}

const formatPrice = (price: number | null): string => {
  if (!price && price !== 0) return ''
  return `Rp${price.toLocaleString('id-ID')}`
}

// Generate flat list of labels for printing
const printLabels = computed(() => {
  const labels: { barcode: string; product_name: string; price: number | null; index: number }[] = []
  let idx = 0
  for (const entry of entries.value) {
    if (!entry.barcode) continue
    for (let i = 0; i < entry.quantity; i++) {
      labels.push({
        barcode: entry.barcode,
        product_name: entry.product_name,
        price: entry.price,
        index: idx++
      })
    }
  }
  return labels
})

const showPrintArea = ref(false)

const doPrint = () => {
  if (printLabels.value.length === 0) return

  // Show print area so SVGs are rendered in the DOM
  showPrintArea.value = true

  nextTick(() => {
    // Render barcodes on SVGs
    for (const label of printLabels.value) {
      try {
        JsBarcode(`#print-barcode-${label.index}`, label.barcode, {
          format: 'EAN13',
          width: 1,
          height: 40,
          fontSize: 10,
          margin: 2,
          displayValue: true,
        })
      } catch (e) {
        console.error('Barcode render error:', e)
      }
    }

    nextTick(() => {
      window.print()
    })
  })
}
</script>

<template>
  <main>
    <h1 class="text-2xl font-bold no-print">Print Multiple Barcodes</h1>

    <div class="my-4 space-y-4 no-print">
      <div
        v-for="(entry, index) in entries"
        :key="entry.id"
        class="flex items-end gap-3 p-3 rounded-lg border border-default bg-elevated">
        <div class="flex-1 min-w-0">
          <label class="block text-sm font-medium mb-1">Barcode</label>
          <InfiniteLoadingBarcode
            v-model="entry.barcodeId"
            @update:model-value="(id: number | undefined) => { if (id) onBarcodeSelect(index, id) }" />
        </div>
        <div class="w-32">
          <label class="block text-sm font-medium mb-1">Price</label>
          <UInput
            v-model.number="entry.price"
            type="number"
            placeholder="Price..."
            class="w-full" />
        </div>
        <div class="w-24">
          <label class="block text-sm font-medium mb-1">Qty</label>
          <UInput
            v-model.number="entry.quantity"
            type="number"
            :min="1"
            placeholder="Qty..."
            class="w-full" />
        </div>
        <div class="shrink-0">
          <UButton
            v-if="entries.length > 1"
            icon="i-mdi-delete"
            color="error"
            variant="ghost"
            @click="removeEntry(index)"
            aria-label="Remove entry" />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UButton
          icon="i-mdi-plus"
          label="Add Barcode"
          variant="outline"
          color="primary"
          @click="addEntry" />
        <UButton
          icon="i-mdi-printer"
          label="Print"
          variant="solid"
          color="primary"
          @click="doPrint"
          :disabled="printLabels.length === 0" />
        <span class="text-sm text-muted">
          Total labels: {{ printLabels.length }}
        </span>
      </div>
    </div>

    <!-- Print Area (hidden on screen, shown for print) -->
    <div v-if="showPrintArea" class="print-area">
      <div class="label-grid">
        <div
          v-for="label in printLabels"
          :key="label.index"
          class="label-cell">
          <div class="label-product-name">{{ label.product_name }}</div>
          <svg :id="'print-barcode-' + label.index" class="label-barcode"></svg>
          <div class="label-price">{{ formatPrice(label.price) }}</div>
        </div>
      </div>
    </div>

  </main>
</template>

<style scoped>
.print-area {
  position: absolute;
  left: -9999px;
  top: 0;
}

@page {
  size: 90mm 46mm;
  margin: 0;
}

@media print {
  .no-print {
    display: none !important;
  }

  .print-area {
    position: static !important;
    left: auto !important;
    display: block !important;
    background: white !important;
    width: 90mm;
  }

  .label-grid {
    display: flex;
    flex-wrap: wrap;
    width: 90mm;
    margin: 0;
    padding: 0;
  }

  .label-cell {
    width: 30mm;
    height: 46mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1mm;
    overflow: hidden;
    page-break-inside: avoid;
  }

  .label-product-name {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 6pt;
    font-weight: normal;
    text-align: center;
    line-height: 1.2;
    max-height: 10mm;
    overflow: hidden;
    word-break: break-word;
    margin-bottom: 1mm;
    color: #000;
  }

  .label-barcode {
    max-width: 28mm;
    height: auto;
    display: block;
  }

  .label-price {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 7pt;
    font-weight: bold;
    text-align: center;
    margin-top: 1mm;
    color: #000;
  }
}
</style>

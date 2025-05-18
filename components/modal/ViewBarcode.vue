<script setup lang="ts">
import JsBarcode from 'jsbarcode'

const props = defineProps<{
  id: number
}>()

const $fetchWithToken = fetchWithToken()

const state = reactive({
  status_name: '',
  category_name: '',
  supplier_name: '',
  product_name: '',
  barcode: '',
  created_at: ''
})

const initState = async () => {
  try {
    const { data } = await $fetchWithToken(`/api/barcodes/${props.id}`)

    if (data) {
      state.status_name = data.status_name
      state.category_name = data.category_name
      state.supplier_name = data.supplier_name
      state.product_name = data.product_name
      state.barcode = data.barcode
      state.created_at = data.created_at
    }
  } catch (error: any) {
    console.error(error)
  }
}

const isShowBarcode = ref(false)
const drawBarcode = async () => {
  if (state.barcode.length !== 13) {
    return
  }

  isShowBarcode.value = true

  try {
    JsBarcode('#barcode', state.barcode, {
      format: 'EAN13'
    })
  } catch (error: any) {
    console.error(error)
    isShowBarcode.value = false
  }
}

onMounted(async () => {
  await initState()
  await drawBarcode()
})
</script>

<template>
  <UModal
    title="View Barcode"
    description="This is the barcode for the product.">
    <template #body>
      <div class="space-y-4 flex flex-col">
        <UInput :model-value="state.status_name" class="max-w-lg" readonly />
        <UInput :model-value="state.category_name" class="max-w-lg" readonly />
        <UInput :model-value="state.supplier_name" class="max-w-lg" readonly />
        <UInput :model-value="state.product_name" class="max-w-lg" readonly />
        <div class="flex space-x-4">
          <UInput :model-value="state.barcode" class="w-1/2 max-w-lg" readonly />
          <UInput :model-value="dateFormatted(state.created_at)" class="w-1/2 max-w-lg" readonly />
        </div>
        <canvas id="barcode" class="mx-auto bg-neutral-200 dark:bg-neutral-800 rounded-lg p-2"></canvas>
      </div>
    </template>
  </UModal>
</template>

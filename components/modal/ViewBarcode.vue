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
  created_at: '',
  created_by_user: ''
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
      state.created_by_user = data.created_by_user
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

const copied = ref(false)
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
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
        <div class="space-x-4 flex items-center">
          <UInput :model-value="dateFormatted(state.created_at)" class="w-1/2 max-w-lg" readonly />
          <UInput :model-value="state.created_by_user" class="w-1/2 max-w-lg" readonly />
        </div>
        <UInput
          :model-value="state.barcode"
          class="max-w-lg"
          readonly
          :ui="{ trailing: 'pe-1' }">
          <template v-if="state.barcode?.length" #trailing>
            <UTooltip text="Copy to clipboard" :content="{ side: 'right' }">
              <UButton
                :color="copied ? 'success' : 'neutral'"
                variant="link"
                size="sm"
                :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                aria-label="Copy to clipboard"
                @click="copyToClipboard(state.barcode)" />
            </UTooltip>
          </template>
        </UInput>
        <canvas id="barcode" class="mx-auto bg-neutral-200 dark:bg-neutral-800 rounded-lg p-2"></canvas>
      </div>
    </template>
  </UModal>
</template>

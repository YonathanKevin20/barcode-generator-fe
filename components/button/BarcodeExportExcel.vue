<script setup lang="ts">
import xlsx from 'node-xlsx'
import type { WorkSheetOptions } from 'node-xlsx'
import type { Barcode } from '~/types/barcode'

const props = defineProps<{
  ids: Array<number>
}>()

const $fetchWithToken = fetchWithToken()
const dayjs = useDayjs()

const dataItems = ref<Barcode[]>([])

const toast = useToast()

const pending = ref(false)
const getActiveBarcodes = async () => {
  pending.value = true

  try {
    const { data } = await $fetchWithToken(`/api/barcodes/active`, {
      query: {
        id: props.ids
      }
    })

    dataItems.value = data
  } catch (error: any) {
    const message = error.data.error?.message || error.data.message
    toast.add({ title: message })
  } finally {
    pending.value = false
  }
}

const exportExcel = async () => {
  if (props.ids.length === 0) {
    toast.add({ title: 'No barcodes selected' })
    return
  }

  await getActiveBarcodes()
  if (dataItems.value.length === 0) {
    toast.add({ title: 'No barcodes found' })
    return
  }

  const convertedArray = dataItems.value.map((d, index) => [
    index + 1,
    d.status_name,
    d.category_name,
    d.supplier_name,
    d.product_name,
    d.barcode,
    dayjs(d.created_at).format('YYYY-MM-DD HH:mm:ss'),
    d.created_by_user
  ])
  const rows = [
    ['#', 'STATUS', 'CATEGORY', 'SUPPLIER', 'PRODUCT', 'BARCODE', 'CREATED AT', 'CREATED BY'],
    ...convertedArray
  ]
  const sheetOptions: WorkSheetOptions = {
    '!cols': [
      { wch: 5 },
      { wch: 10 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 }
    ]
  }
  const buffer = xlsx.build([{
    name: 'Sheet1',
    data: rows,
    options: sheetOptions
  }])

  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Barcodes_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <UButton
    label="Export Excel"
    variant="solid"
    color="primary"
    :loading="pending"
    @click="exportExcel()"
    class="cursor-pointer" />
</template>

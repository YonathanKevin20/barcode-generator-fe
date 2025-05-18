<script setup lang="ts">
import xlsx from 'node-xlsx'
import type { WorkSheetOptions } from 'node-xlsx'
import type { Barcode } from '~/types/barcode'

const props = defineProps<{
  data: Array<Barcode>
}>()
const dayjs = useDayjs()

const pending = ref(false)
const exportExcel = () => {
  pending.value = true

  const convertedArray = props.data.map((d, index) => [
    index + 1,
    d.status_name,
    d.category_name,
    d.supplier_name,
    d.product_name,
    d.barcode,
    dayjs(d.created_at).format('YYYY-MM-DD HH:mm:ss')
  ])
  const rows = [
    ['#', 'STATUS', 'CATEGORY', 'SUPPLIER', 'PRODUCT', 'BARCODE', 'CREATED AT'],
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
  a.download = `Barcodes.xlsx`
  a.click()
  a.remove()
  URL.revokeObjectURL(url)

  pending.value = false
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

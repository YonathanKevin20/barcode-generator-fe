<script setup lang="ts">
import { ButtonBarcodeExportExcel, ModalDeleteBarcode, ModalViewBarcode } from '#components'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { PaginatedResponse } from '~/types/response'
import type { Barcode } from '~/types/barcode'

useHead({
  title: 'Barcodes'
})
definePageMeta({
  middleware: ['sidebase-auth']
})

const $fetchWithToken = fetchWithToken()
const table = useTemplateRef('table')

const { data: dataAuth } = useAuth()

const isAdmin = computed(() => dataAuth.value?.data.role === 'admin')

const columns: TableColumn<Barcode>[] = [
  {
    accessorKey: 'status_name',
    header: 'STATUS',
  },
  {
    accessorKey: 'category_name',
    header: 'CATEGORY',
  },
  {
    accessorKey: 'supplier_name',
    header: 'SUPPLIER',
  },
  {
    accessorKey: 'product_name',
    header: 'PRODUCT',
  },
  {
    accessorKey: 'barcode',
    header: 'BARCODE',
  },
  {
    accessorKey: 'created_at',
    header: 'CREATED AT',
  },
  {
    accessorKey: 'created_by_user',
    header: 'CREATED BY',
  },
  {
    accessorKey: 'actions',
    header: 'ACTIONS',
    meta: {
      class: {
        th: 'text-center',
        td: 'text-center'
      }
    }
  }
]
const actionItems = (row: Barcode): DropdownMenuItem[][] => {
  const items: DropdownMenuItem[][] = [
    [{
      label: row.is_inactive ? 'Set Active' : 'Set Inactive',
      icon: row.is_inactive ? 'i-mdi-barcode-scan' : 'i-mdi-barcode-off',
      onSelect: () => updateBarcodeInactive(row.id)
    }]
  ]

  const viewDelete: DropdownMenuItem[] = [
    {
      label: 'View',
      icon: 'i-mdi-eye',
      onSelect: () => openModalViewBarcode(row.id)
    }
  ]
  if (isAdmin.value) {
    viewDelete.push({
      label: 'Delete',
      icon: 'i-mdi-delete',
      color: 'error',
      onSelect: () => openModalDeleteBarcode(row.id)
    })
  }
  items.push(viewDelete)
  return items
}

const toast = useToast()

const updateBarcodeInactive = async (id: number) => {
  const { data } = await $fetchWithToken(`/api/barcodes/${id}/inactive`, {
    method: 'PATCH'
  })

  toast.add({ title: data.message })
  refresh()
}

const overlay = useOverlay()
const modalDeleteBarcode = overlay.create(ModalDeleteBarcode)
const modalViewBarcode = overlay.create(ModalViewBarcode)
const openModalDeleteBarcode = (id: number) => {
  modalDeleteBarcode.open({
    id,
    onSuccess: () => refresh()
  })
}
const openModalViewBarcode = (id: number) => {
  modalViewBarcode.open({
    id
  })
}

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
watch(() => pagination.value.pageSize, () => {
  refresh()
})

const search = reactive({
  status_id: 0,
  barcode: '',
})
watch(search, () => {
  table.value?.tableApi?.resetPagination()
})

const { data, status, refresh } = await useLazyAsyncData('barcodes', () => $fetchWithToken<PaginatedResponse<Barcode>>(`/api/barcodes`, {
  params: {
    page: pagination.value.pageIndex + 1,
    limit: pagination.value.pageSize,
    status_id: search.status_id,
    barcode: search.barcode
  }
}), {
  default: () => ({
    data: [],
    limit: 10,
    page: 1,
    total: 0,
    total_page: 0
  }),
  watch: [pagination, search]
})

const dataItems = computed(() => data.value?.data || [])
const totalItem = computed(() => data.value?.total || 0)
</script>

<template>
  <main>
    <h1 class="text-2xl font-bold">List of Barcodes</h1>

    <div class="flex items-center space-x-2 my-4">
      <UButton
        to="/barcodes/generate"
        label="Generate"
        variant="solid"
        color="info" />
      <ButtonBarcodeExportExcel
        :data="dataItems" />
      <UButton
        to="/barcodes/print-multiple"
        label="Print Multiple"
        variant="subtle"
        color="primary" />
    </div>

    <div class="overflow-x-auto border-t border-default py-4 grid grid-cols-3">
      <div class="flex items-center gap-4 col-span-2">
        <SelectMenuStatus v-model="search.status_id" :showAll="true" />
        <UInput
          v-model="search.barcode"
          placeholder="Search by barcode..."
          icon="i-mdi-barcode"
          class="w-full md:w-48" />
        <span>{{ totalItem }} items</span>
        <SelectPaginationPage v-model="pagination.pageSize" />
      </div>
      <UPagination
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="totalItem"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        class="flex items-center justify-end col-span-1" />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :loading="status === 'pending'"
      :columns="columns"
      :data="dataItems"
      class="mb-8 rounded-lg border-2 border-default">
      <template #barcode-cell="{ row }">
        <span
          class="hover:underline cursor-pointer"
          :class="{
            'text-sky-500': !row.original.is_inactive,
            'text-red-500': row.original.is_inactive,
          }"
          @click="openModalViewBarcode(row.original.id)">{{ row.original.barcode }}</span>
      </template>
      <template #created_at-cell="{ row }">{{ dateFormatted(row.original.created_at) }}</template>
      <template #actions-cell="{ row }">
        <UDropdownMenu :items="actionItems(row.original)">
          <UButton color="neutral" variant="ghost" icon="i-mdi-dots-vertical" aria-label="Actions" />
        </UDropdownMenu>
      </template>
    </UTable>
  </main>
</template>

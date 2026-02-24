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

const { data: dataAuth } = useAuth()

const isAdmin = computed(() => dataAuth.value?.data.role === 'admin')

const UCheckbox = resolveComponent('UCheckbox')
const columns: TableColumn<Barcode>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      row.original.is_inactive
        ? null
        : h(UCheckbox, {
            modelValue: row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
            'aria-label': 'Select row'
          })
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
  },
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
  rowSelection.value = {}
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
  pageSize: 20
})

watch(() => pagination.value.pageSize, () => {
  pagination.value.pageIndex = 0
  refresh()
})
watch(() => pagination.value.pageIndex, () => {
  refresh()
})

const search = reactive({
  status_id: 0,
  category_name: '',
  supplier_name: '',
  product_name: '',
  barcode: '',
})
watch(search, () => {
  pagination.value.pageIndex = 0
  refresh()
})
watch(() => search.product_name, (val) => {
  if (val !== val.toUpperCase()) {
    search.product_name = val.toUpperCase()
  }
})

const { data, status, refresh } = await useLazyAsyncData('barcodes', () => $fetchWithToken<PaginatedResponse<Barcode>>(`/api/barcodes`, {
  params: {
    page: pagination.value.pageIndex + 1,
    limit: pagination.value.pageSize,
    status_id: search.status_id,
    category_name: search.category_name,
    supplier_name: search.supplier_name,
    product_name: search.product_name,
    barcode: search.barcode
  }
}), {
  default: () => ({
    data: [],
    limit: 10,
    page: 1,
    total: 0,
    total_page: 0
  })
})

const dataItems = computed(() => data.value?.data || [])
const totalItem = computed(() => data.value?.total || 0)
const rowSelection = ref<Record<string, boolean>>({})
const selectedIds = computed(() => {
  return Object.entries(rowSelection.value)
    .map(([key]) => Number(key))
    .filter((id) => id)
})
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
        :ids="selectedIds" />
      <UButton
        to="/barcodes/print-multiple"
        label="Print Multiple"
        variant="subtle"
        color="primary" />
    </div>

    <div class="overflow-x-auto border-t border-default py-4 grid grid-cols-3 gap-4">
      <div class="flex items-center gap-4 col-span-3">
        <SelectMenuStatus v-model="search.status_id" :showAll="true" />
        <UInput
          name="category_name"
          v-model="search.category_name"
          placeholder="Search by category..."
          icon="i-mdi-magnify"
          class="w-full md:w-64" />
        <UInput
          name="supplier_name"
          v-model="search.supplier_name"
          placeholder="Search by supplier..."
          icon="i-mdi-magnify"
          class="w-full md:w-64" />
        <UInput
          name="product_name"
          v-model="search.product_name"
          placeholder="Search by product..."
          icon="i-mdi-magnify"
          class="w-full md:w-64" />
        <UInput
          name="barcode"
          v-model="search.barcode"
          placeholder="Search by barcode..."
          icon="i-mdi-barcode"
          class="w-full md:w-48" />
      </div>
      <div class="flex items-center gap-4 col-span-2">
        <SelectPaginationPage v-model="pagination.pageSize" />
        <span>{{ selectedIds.length }} of {{ totalItem }} items selected</span>
      </div>
      <UPagination
        :page="pagination.pageIndex + 1"
        :items-per-page="pagination.pageSize"
        :total="totalItem"
        @update:page="(p: number) => pagination.pageIndex = p - 1"
        class="flex items-center justify-end col-span-1" />
    </div>

    <UTable
      v-model:pagination="pagination"
      v-model:row-selection="rowSelection"
      :pagination-options="{ manualPagination: true, rowCount: totalItem, autoResetPageIndex: false }"
      :loading="status === 'pending'"
      :columns="columns"
      :data="dataItems"
      :get-row-id="row => row.is_inactive ? row.id + '-inactive' : ''+row.id"
      class="rounded-lg border-2 border-default">
      <template #actions-cell="{ row }">
        <UDropdownMenu :items="actionItems(row.original)">
          <UButton color="neutral" variant="ghost" icon="i-mdi-dots-vertical" aria-label="Actions" />
        </UDropdownMenu>
      </template>
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
    </UTable>
  </main>
</template>

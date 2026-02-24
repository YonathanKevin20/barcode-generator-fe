<script setup lang="ts">
import { ModalDeleteSupplier } from '#components'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { PaginatedResponse } from '~/types/response'
import type { Supplier } from '~/types/supplier'

useHead({
  title: 'Suppliers'
})
definePageMeta({
  middleware: ['sidebase-auth', 'admin']
})

const $fetchWithToken = fetchWithToken()

const columns: TableColumn<Supplier>[] = [
  {
    accessorKey: 'code',
    header: 'CODE',
  },
  {
    accessorKey: 'name',
    header: 'SUPPLIER',
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
const actionItems = (row: Supplier): DropdownMenuItem[][] => [
  [{
    label: 'Edit',
    icon: 'i-mdi-pencil',
    onSelect: () => navigateTo(`/suppliers/${row.id}/edit`)
  },
  {
    label: 'Delete',
    icon: 'i-mdi-delete',
    color: 'error',
    onSelect: () => openModalDeleteSupplier(row.id)
  }]
]

const overlay = useOverlay()
const modaDeleteSupplier = overlay.create(ModalDeleteSupplier)
const openModalDeleteSupplier = (id: number) => {
  modaDeleteSupplier.open({
    id,
    onSuccess: () => refresh()
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
  code: '',
  name: ''
})
watch(search, () => {
  pagination.value.pageIndex = 0
  refresh()
})

const { data, status, refresh } = await useLazyAsyncData('suppliers', () => $fetchWithToken<PaginatedResponse<Supplier>>(`/api/suppliers`, {
  params: {
    page: pagination.value.pageIndex + 1,
    limit: pagination.value.pageSize,
    code: search.code,
    name: search.name
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
</script>

<template>
  <main>
    <h1 class="text-2xl font-bold">List of Suppliers</h1>

    <div class="flex items-center space-x-2 my-4">
      <UButton
        to="/suppliers/create"
        label="Create"
        variant="solid"
        color="info" />
    </div>

    <div class="overflow-x-auto border-t border-default py-4 grid grid-cols-3 gap-4">
      <div class="flex items-center gap-4 col-span-3">
        <UInput
          name="code"
          v-model="search.code"
          placeholder="Search by code..."
          icon="i-mdi-barcode"
          class="w-full md:w-48" />
        <UInput
          name="name"
          v-model="search.name"
          placeholder="Search by name..."
          icon="i-mdi-magnify"
          class="w-full md:w-64" />
      </div>
      <div class="flex items-center gap-4 col-span-2">
        <SelectPaginationPage v-model="pagination.pageSize" />
        <span>{{ totalItem }} items</span>
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
      :pagination-options="{ manualPagination: true, rowCount: totalItem, autoResetPageIndex: false }"
      :loading="status === 'pending'"
      :columns="columns"
      :data="dataItems"
      class="mb-8 rounded-lg border-2 border-default">
      <template #actions-cell="{ row }">
        <UDropdownMenu :items="actionItems(row.original)">
          <UButton color="neutral" variant="ghost" icon="i-mdi-dots-vertical" aria-label="Actions" />
        </UDropdownMenu>
      </template>
    </UTable>
  </main>
</template>

<script setup lang="ts">
import { ModalDeleteUser } from '#components'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { PaginatedResponse } from '~/types/response'
import type { User } from '~/types/user'

useHead({
  title: 'Users'
})
definePageMeta({
  middleware: ['sidebase-auth', 'admin']
})

const $fetchWithToken = fetchWithToken()
const table = useTemplateRef('table')
const { data: userData } = useAuth()

const isSelf = (id: number) => userData.value?.data.id === id

const columns: TableColumn<User>[] = [
  {
    accessorKey: 'username',
    header: 'USERNAME',
  },
  {
    accessorKey: 'role',
    header: 'ROLE',
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
const actionItems = (row: User): DropdownMenuItem[][] => [
  [{
    label: 'Edit',
    icon: 'i-mdi-pencil',
    onSelect: () => navigateTo(`/users/${row.id}/edit`)
  },
  {
    label: 'Delete',
    icon: 'i-mdi-delete',
    color: 'error',
    disabled: isSelf(row.id),
    onSelect: () => openModalDeleteUser(row.id)
  }]
]

const overlay = useOverlay()
const modalDeleteUser = overlay.create(ModalDeleteUser)
const openModalDeleteUser = (id: number) => {
  modalDeleteUser.open({
    id,
    onSuccess: () => refresh()
  })
}

const pagination = ref({
  pageIndex: 0,
  pageSize: 20
})
watch(() => pagination.value.pageSize, () => {
  refresh()
})

const search = reactive({
  username: '',
  role: ''
})
watch(search, () => {
  table.value?.tableApi?.resetPagination()
})

const { data, status, refresh } = await useLazyAsyncData('users', () => $fetchWithToken<PaginatedResponse<User>>(`/api/users`, {
  params: {
    page: pagination.value.pageIndex + 1,
    limit: pagination.value.pageSize,
    username: search.username,
    role: search.role
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
    <h1 class="text-2xl font-bold">List of Users</h1>

    <div class="flex items-center space-x-2 my-4">
      <UButton
        to="/users/create"
        label="Create"
        variant="solid"
        color="info" />
    </div>

    <div class="overflow-x-auto border-t border-default py-4 grid grid-cols-3">
      <div class="flex items-center gap-4 col-span-2">
        <SelectMenuRole v-model="search.role" :showAll="true" />
        <UInput
          name="username"
          v-model="search.username"
          placeholder="Search by username..."
          icon="i-mdi-magnify"
          class="w-full md:w-64" />
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
      <template #actions-cell="{ row }">
        <UDropdownMenu :items="actionItems(row.original)">
          <UButton color="neutral" variant="ghost" icon="i-mdi-dots-vertical" aria-label="Actions" />
        </UDropdownMenu>
      </template>
    </UTable>
  </main>
</template>

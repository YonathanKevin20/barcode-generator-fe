<script setup lang="ts">
import InfiniteLoading from 'v3-infinite-loading'
import type { Barcode } from '~/types/barcode'

const $fetchWithToken = fetchWithToken()
const dropdownManager = useDropdownManager()
const dropdownId = 'barcode-dropdown-' + Math.random().toString(36).substring(2, 9)

const model = defineModel<number>()
const barcodes = ref<Barcode[]>([])
const page = ref(1)
const noMore = ref(false)
const searchName = ref('')
const isDropdownOpen = ref(false)
const isFocused = ref(false)

// Register this dropdown
onMounted(() => {
  dropdownManager.register(dropdownId)
})

// Watch for active dropdown changes
watch(() => dropdownManager.activeDropdown.value, (activeId) => {
  if (activeId !== dropdownId && isDropdownOpen.value) {
    isDropdownOpen.value = false
    isFocused.value = false
  }
})

// Compute the selected barcode name
const selectedBarcode = computed(() => {
  if (!model.value) return null
  return barcodes.value.find(item => item.id === model.value)
})

// Display text in input
const displayText = computed(() => {
  if (isFocused.value) {
    return searchName.value
  }
  return selectedBarcode.value ? selectedBarcode.value.product_name + ' [' + selectedBarcode.value.barcode + ']' : ''
})

// Handle infinite loading
const infiniteHandler = async ($state: any) => {
  if (noMore.value) {
    $state.complete()
    return
  }

  try {
    const { data } = await $fetchWithToken(`/api/barcodes`, {
      params: {
        page: page.value,
        search: searchName.value,
        active: true
      }
    })
    const newItems = data

    if (newItems.length) {
      barcodes.value.push(...newItems)
      page.value += 1
      $state.loaded()
    } else {
      noMore.value = true
      $state.complete()
    }
  } catch (error) {
    console.error('Error loading barcodes:', error)
    $state.error()
  }
}

const reloadState = () => {
  barcodes.value = []
  page.value = 1
  noMore.value = false
}

// Reset search and pagination when opening the dropdown
const onInputFocus = () => {
  isFocused.value = true
  isDropdownOpen.value = true
  dropdownManager.setActive(dropdownId)
  searchName.value = ''
  reloadState()
}

// Handle input blur
const onInputBlur = () => {
  // Small timeout to allow click events to register first
  setTimeout(() => {
    isFocused.value = false
    if (!selectedBarcode.value) {
      searchName.value = ''
    }
  }, 150)
}

// Handle search with debounce
const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchName.value = target.value

  // Reset and reload when search changes
  reloadState()
}

// Handle item selection
const selectItem = (item: Barcode) => {
  model.value = item.id
  isFocused.value = false
  isDropdownOpen.value = false
}

// Toggle dropdown
const toggleDropdown = () => {
  if (!isDropdownOpen.value) {
    dropdownManager.setActive(dropdownId)
  } else {
    dropdownManager.clearActive(dropdownId)
  }
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    isFocused.value = true
    searchName.value = ''
    reloadState()
  }
}

// Close dropdown on outside click
const closeDropdown = (event: Event) => {
  if (!(event.target as Element).closest('.barcode-select')) {
    isDropdownOpen.value = false
    isFocused.value = false
    dropdownManager.clearActive(dropdownId)
  }
}

// Handle keyboard events
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isDropdownOpen.value) {
    isDropdownOpen.value = false
    isFocused.value = false
    dropdownManager.clearActive(dropdownId)
    // Explicitly blur the input element to ensure consistent behavior
    const input = document.querySelector('.barcode-select input')
    if (input instanceof HTMLElement) {
      input.blur()
    }
  }
}

// Add event listener for outside clicks
onMounted(() => {
  document.addEventListener('click', closeDropdown)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  document.removeEventListener('keydown', handleKeyDown)
})

// Clear selection button
const clearSelection = (e: Event) => {
  e.stopPropagation()
  model.value = undefined
  searchName.value = ''
}
</script>

<template>
  <div class="barcode-select relative w-full" @click.stop>
    <!-- Search input -->
    <div class="relative">
      <input
        :value="displayText"
        :placeholder="isFocused ? 'Search barcodes...' : 'Select a barcode'"
        @input="handleSearch"
        @focus="onInputFocus"
        @blur="onInputBlur"
        class="w-full px-4 py-3 rounded-md border cursor-pointer border-zinc-200 dark:border-zinc-700
               bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary
               dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
      />
      <!-- Clear button (X) if an item is selected -->
      <button
        v-if="model && !isFocused"
        @click="clearSelection"
        type="button"
        class="absolute inset-y-0 right-8 flex items-center px-2 text-zinc-400 hover:text-zinc-600
               dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
        <UIcon name="i-lucide-x" class="size-4" />
      </button>

      <!-- Dropdown toggle button -->
      <button
        @click="toggleDropdown"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 dark:text-zinc-500">
        <UIcon name="i-lucide-chevron-down" class="size-5" />
      </button>
    </div>

    <!-- Dropdown with barcodes list -->
    <div
      v-show="isDropdownOpen"
      class="absolute z-10 mt-1 w-full max-h-[300px] overflow-y-auto rounded-md
             border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800
             shadow-lg divide-y divide-zinc-100 dark:divide-zinc-700">
      <!-- Barcodes list -->
      <div
        v-for="item in barcodes" :key="item.id"
        @click="selectItem(item)"
        class="px-4 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition duration-150 ease-in-out"
        :class="{ 'bg-blue-50 dark:bg-blue-900/30': model === item.id }">
        <div class="text-zinc-900 dark:text-zinc-100">{{ item.product_name }} [{{ item.barcode }}]</div>
      </div>

      <!-- Infinite loading component -->
      <InfiniteLoading
        @infinite="infiniteHandler"
        :identifier="searchName">
        <!-- Loading spinner -->
        <template #spinner>
          <LoadingState class="py-3" />
        </template>

        <!-- No more data message -->
        <template #complete>
          <div class="py-3 text-center text-zinc-500 dark:text-zinc-400">No more barcodes</div>
        </template>

        <!-- Error message -->
        <template #error>
          <div class="py-6 text-center">
            <UIcon name="i-mdi-exclamation" class="size-8 text-red-500" />
            <p class="mt-2 text-red-500">Error loading barcodes</p>
          </div>
        </template>
      </InfiniteLoading>
    </div>
  </div>
</template>

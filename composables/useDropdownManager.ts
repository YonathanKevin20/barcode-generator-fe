// Create a unique symbol for type safety
const DropdownManagerKey = Symbol('DropdownManager') as InjectionKey<{
  activeDropdown: Ref<string | null>
  register: (id: string) => void
  setActive: (id: string) => void
  clearActive: (id: string) => void
}>

export const provideDropdownManager = () => {
  // Track currently active dropdown
  const activeDropdown = ref<string | null>(null)

  // Register and manage dropdowns
  const register = (id: string) => {
    // Could track all dropdowns here if needed
  }

  const setActive = (id: string) => {
    activeDropdown.value = id
  }

  const clearActive = (id: string) => {
    // Only clear if this dropdown is the active one
    if (activeDropdown.value === id) {
      activeDropdown.value = null
    }
  }

  provide(DropdownManagerKey, {
    activeDropdown,
    register,
    setActive,
    clearActive
  })
}

export const useDropdownManager = () => {
  const manager = inject(DropdownManagerKey)

  if (!manager) {
    throw new Error('Dropdown manager not provided. Make sure to call provideDropdownManager in your app setup')
  }

  return manager
}

export default defineNuxtRouteMiddleware((to, from) => {
  const { data } = useAuthState()

  if (data.value?.data.role !== 'admin') {
    return navigateTo('/', { replace: true })
  }
})

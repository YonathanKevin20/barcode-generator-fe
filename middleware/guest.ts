export default defineNuxtRouteMiddleware((to, from) => {
  const { status } = useAuthState()

  if (status.value === 'authenticated') {
    return navigateTo('/', { replace: true })
  }
})

const fetchWithToken = () => {
  const { token } = useAuth()

  return $fetch.create({
    onRequest({ request, options, error }) {
      options.headers.set('Accept', 'application/json')

      if (token.value) {
        options.headers.set('Authorization', `${token.value}`)
      }
    },
    async onResponseError({ response }) {
      const { status } = response

      if (status === 401) {
        setTimeout(() => {
          window.location.href = '/login'
        }, 500)

        return Promise.reject(response)
      }
    }
  })
}

export default fetchWithToken

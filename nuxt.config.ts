// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  nitro: {
    preset: 'bun',
  },

  auth: {
    provider: {
      type: 'local',
      endpoints: {
        getSession: { path: '/me', method: 'get' },
      },
      session: {
        dataType: {
          data: {
            id: 'number',
            username: 'string',
            role: 'string'
          }
        }
      },
      token: {
        signInResponseTokenPointer: '/data/token',
        cookieName: 'barcode-generator.token',
        maxAgeInSeconds: 60 * 60 * 24 // 24 hours
      }
    }
  },

  compatibilityDate: '2025-03-23',

  css: ['~/assets/css/main.css'],

  dayjs: {
    plugins: ['timezone']
  },

  devtools: { enabled: true },

  icon: {
    clientBundle: {
      // scan all components in the project and include icons
      scan: true,

      // guard for uncompressed bundle size, will fail the build if exceeds
      sizeLimitKb: 256,
    },
  },

  modules: [
    'dayjs-nuxt',
    '@nuxt/ui',
    '@sidebase/nuxt-auth',
  ],

  runtimeConfig: {
    apiBaseUrl: ''
  }
})

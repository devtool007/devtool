// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  // 使用 nitro.routeRules 配置
  nitro: {
    routeRules: {
      // '/json' 路由访问时，执行永久重定向 (301)
      '/json': { redirect: '/tools/json-formatter' },
      '/base64': { redirect: '/tools/base64-converter' },
      '/unicode': { redirect: '/tools/unicode-converter' },
      '/password': { redirect: '/tools/password-generator' },
      '/timestamp': { redirect: '/tools/timestamp-converter' },
      // 另一个临时重定向 (302) 示例
      // '/old-route': { redirect: { to: '/new-route', statusCode: 302 } },
    }
  },
  css: [
    // 1. Phosphor Icons (保持你刚才配置的)
    '@phosphor-icons/web/regular',
    '@phosphor-icons/web/bold',
    '@phosphor-icons/web/fill',
    '@phosphor-icons/web/duotone',

    // 2. [新增] Prism 本地样式 (对应原来的 prism-tomorrow.min.css)
    'prismjs/themes/prism-tomorrow.css',
  ],

  app: {
    head: {
      title: 'DevTool.com - Developer Utilities',
      meta: [
        { name: 'description', content: 'Free, fast, secure developer tools.' }
      ],
      script: [
        // 🔴 [删除] Prism CDN
        // { src: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js', defer: true },
      ],
      link: [
        // 🔴 [删除] Prism CSS CDN
        // { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css' }
      ]
    }
  },
  ssr: true,
  compatibilityDate: '2024-11-01',
})
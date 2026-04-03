// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  ssr: true,

  experimental: {
    inlineStyles: true,
    payloadExtraction: true,
    treeshakeClientOnly: true,
  },

  vite: {
    server: {
      allowedHosts: [".ngrok-free.app", ".ngrok.io"],
    },
    build: {
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'icons': ['@tabler/icons-vue'],
            'vue-vendor': ['vue', 'vue-router'],
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router'],
    },
  },

  runtimeConfig: {
    // Server-only secrets
    wcApiUrl: process.env.WC_API_URL || '',
    wcConsumerKey: process.env.WC_CONSUMER_KEY || '',
    wcConsumerSecret: process.env.WC_CONSUMER_SECRET || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendFromEmail: process.env.RESEND_FROM_EMAIL || 'promos@tradersyard.com',
    resendAudienceId: process.env.RESEND_AUDIENCE_ID || '',
    databaseUrl: process.env.DATABASE_URL || '',
    ipHashSalt: process.env.IP_HASH_SALT || 'change-me',
    adminApiKey: process.env.ADMIN_API_KEY || '',
    jackpotWebhookUrl: process.env.JACKPOT_WEBHOOK_URL || '',
    campaignEndDate: process.env.CAMPAIGN_END_DATE || '2026-04-10T23:59:59-05:00',
    omnisendApiKey: process.env.OMNISEND_API_KEY || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    public: {
      discordUrl: "https://discord.gg/2j2zYnTHYp",
      xUrl: "https://twitter.com/TradersYard",
      supportEmail: "support@tradersyard.com",
      challengesUrl: "https://app.tradersyard.com/challenges",
    },
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/image",
  ],

  image: {
    quality: 80,
  },

  app: {
    head: {
      title: "Hatch a Chance — TradersYard Easter 2026",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/landing/favicon.ico" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
          media: "print",
          onload: "this.media='all'",
        },
        {
          rel: "preload",
          href: "/landing/fonts/clash-display/ClashDisplay-Semibold.woff2",
          as: "font",
          type: "font/woff2",
          crossorigin: "anonymous",
        },
      ],
      meta: [
        {
          name: "description",
          content: "Crack your Easter egg and win a prize — everyone wins something. One crack only. April 5–10, 2026.",
        },
        {
          property: "og:title",
          content: "🥚 Hatch a Chance — TradersYard Easter 2026",
        },
        {
          property: "og:description",
          content: "One crack. One offer. Everyone wins something. Available April 5–10, 2026.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@TradersYard" },
      ],
      script: [
        {
          innerHTML: `(function(){try{var t=document.cookie.match(/theme=([^;]+)/);var s=t?t[1]:localStorage.getItem('theme');if(s!=='light'){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          tagPosition: "head",
        },
        {
          innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://sst.tradersyard.com/1y7luozuoyg.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','7av0u9cw=aWQ9R1RNLVBSTk0yTVM%3D&apiKey=34775de9');`,
          tagPosition: "bodyOpen",
        },
      ],
    },
    pageTransition: { name: "page", mode: "out-in" },
  },

  routeRules: {
    "/": { redirect: { to: "/easter", statusCode: 301 } },
    "/easter": { ssr: true },
    "/api/easter/**": { cors: false },
  },

  nitro: {
    compressPublicAssets: true,
    minify: true,
    prerender: {
      crawlLinks: false,
      failOnError: false,
    },
  },

  css: ["../assets/css/main.css"],
});

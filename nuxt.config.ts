// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css", "vue3-toastify/dist/index.css"],
  modules: ["@logto/nuxt"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    logtoAppSecret: process.env.NUXT_LOGTO_APP_SECRET,
    logtoCookieEncryptionKey: process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY,
    // Public keys (exposed to client-side)
    public: {
      appName: process.env.APP_NAME || "Nuxt Gemini Chatbot",
      logtoEndpoint: process.env.NUXT_LOGTO_ENDPOINT,
      logtoAppId: process.env.NUXT_LOGTO_APP_ID,
    },
  },
});

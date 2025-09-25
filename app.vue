<template>
  <div class="min-h-screen flex flex-col">
    <NuxtRouteAnnouncer />
    <!-- Only show navbar on non-chat pages -->
    <AppNavbar v-if="!route.path.startsWith('/chat')" />
    <main
      class="flex-1 min-h-0"
      :class="{ 'h-screen': route.path.startsWith('/chat') }"
    >
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
// Get current route
const route = useRoute();
const config = useRuntimeConfig();

// Set default app title
useHead({
  titleTemplate: (title?: string) => {
    const appName = config.public.appName || "FS Gemini Chat";
    return title ? `${appName} | ${title}` : appName;
  },
});

// Global auth check
const { checkAuth } = useAuth();

// Check authentication on app startup (only for non-protected pages)
onMounted(() => {
  // Skip auth check if middleware will handle it
  if (
    !route.path.startsWith("/chat") &&
    !route.path.startsWith("/auth/sign-out")
  ) {
    checkAuth();
  }
});
</script>

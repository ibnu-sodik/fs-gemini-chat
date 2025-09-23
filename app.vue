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

// Global auth check
const { checkAuth } = useAuth();

// Check authentication on app startup
onMounted(() => {
  checkAuth();
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <NuxtRouteAnnouncer />
    <AppNavbar />
    <main class="flex-1 min-h-0">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
// Global auth check
const { checkAuth } = useAuth();

// Check authentication on app startup
onMounted(() => {
  checkAuth();
});
</script>

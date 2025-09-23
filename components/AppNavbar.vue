<template>
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900">
            {{ $config.public.appName }}
          </NuxtLink>
        </div>

        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <!-- Navigation links for authenticated users -->
            <div class="hidden md:flex items-center space-x-4">
              <NuxtLink
                v-if="!isOnChatPage"
                to="/chat"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors font-medium"
              >
                Chat
              </NuxtLink>
              <NuxtLink
                v-if="isOnChatPage"
                to="/"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
              >
                ← Home
              </NuxtLink>
            </div>

            <div class="flex items-center space-x-3">
              <span class="text-sm text-gray-700">
                Halo,
                {{ (user as any)?.name || (user as any)?.email || "User" }}
              </span>
              <button
                @click="handleSignOut"
                :disabled="isLoading"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <span v-if="isLoading">Keluar...</span>
                <span v-else>Keluar</span>
              </button>
            </div>
          </template>

          <template v-else>
            <NuxtLink
              to="/auth/sign-in"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Masuk
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { isAuthenticated, user, signOut, isLoading } = useAuth();
const config = useRuntimeConfig();
const route = useRoute();

// Check if current page is chat page
const isOnChatPage = computed(() => {
  return route.path.startsWith("/chat");
});

const handleSignOut = async () => {
  await signOut();
};
</script>

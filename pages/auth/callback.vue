<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ isError ? "Authentication Error" : "Processing Authentication" }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ errorMessage || "Memproses autentikasi..." }}
        </p>
      </div>
      <div class="flex justify-center">
        <div
          v-if="!isError"
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        ></div>
        <div v-else class="text-center">
          <div class="text-red-500 text-4xl mb-4">⚠️</div>
          <button
            @click="redirectToLogin"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const isError = ref(false);
const errorMessage = ref("");

const redirectToLogin = () => {
  navigateTo("/auth/sign-in");
};

// Process callback when component mounts
onMounted(async () => {
  try {
    const code = route.query.code as string;
    const state = route.query.state as string;
    const error = route.query.error as string;

    if (error) {
      isError.value = true;
      errorMessage.value = `Authentication failed: ${error}`;
      return;
    }

    if (!code) {
      isError.value = true;
      errorMessage.value = "Missing authorization code";
      return;
    }

    // Exchange authorization code for tokens
    const response = (await $fetch("/api/auth/callback", {
      method: "POST",
      body: {
        code,
        state,
      },
    })) as { success: boolean; error?: string };

    if (response.success) {
      // Small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force refresh auth state immediately
      const { refreshAuth } = useAuth();
      await refreshAuth();

      // Another small delay to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirect to intended page or home
      const redirectTo = sessionStorage.getItem("auth-redirect") || "/chat";
      sessionStorage.removeItem("auth-redirect");

      await navigateTo(redirectTo);
    } else {
      isError.value = true;
      errorMessage.value = response.error || "Authentication failed";
    }
  } catch (error) {
    console.error("Callback error:", error);
    isError.value = true;
    errorMessage.value = "Something went wrong during authentication";
  }
});
</script>

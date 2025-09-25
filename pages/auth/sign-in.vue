<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Masuk ke akun Anda
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Silakan masuk untuk melanjutkan ke chat
        </p>
      </div>
      <div class="mt-8 space-y-6">
        <button
          @click="handleSignIn"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
        >
          Masuk dengan Logto
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page title
useHead({
  title: "Sign In",
});

// Apply guest middleware to prevent access when already logged in
definePageMeta({
  middleware: "guest",
});

const { signIn, isAuthenticated } = useAuth();

const handleSignIn = async () => {
  await signIn();
};
</script>

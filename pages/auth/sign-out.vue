<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Keluar dari akun
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Anda akan keluar dari aplikasi...
        </p>
      </div>
      <div class="flex justify-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Apply auth middleware to ensure user is logged in before accessing sign-out
definePageMeta({
  middleware: "auth",
});

// Halaman ini akan dihandle otomatis oleh Logto untuk sign out
</script>

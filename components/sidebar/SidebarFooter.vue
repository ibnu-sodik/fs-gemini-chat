<script setup lang="ts">
function handleLogout() {
  // TODO: Implement logout functionality
  console.log("Logout clicked");
}
</script>

<template>
  <div class="p-3 border-t border-gray-200 mt-auto">
    <!-- User Profile Section -->
    <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <!-- User Photo (placeholder) -->
      <div
        class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
      >
        <span class="text-white text-sm font-medium">U</span>
      </div>

      <!-- User Name -->
      <div class="flex-1 mx-3">
        <span class="text-sm font-medium text-gray-700">User Name</span>
      </div>

      <!-- Logout Button -->
      <button
        @click="handleLogout"
        class="p-1.5 text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-200 rounded transition-colors"
        title="Logout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

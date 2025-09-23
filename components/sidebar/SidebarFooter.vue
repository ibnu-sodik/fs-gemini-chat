<script setup lang="ts">
const { user, signOut } = useAuth();

async function handleLogout() {
  try {
    await signOut();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Get user initials for avatar
const userInitials = computed(() => {
  const userData = user.value as any;
  if (!userData?.name) return "U";
  return userData.name
    .split(" ")
    .map((name: string) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// Get user data safely
const userData = computed(() => user.value as any);
</script>

<template>
  <div class="p-2 border-t border-gray-200 mt-auto">
    <!-- User Profile Section -->
    <div class="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
      <!-- User Photo -->
      <div
        v-if="userData?.picture"
        class="w-8 h-8 rounded-full overflow-hidden"
      >
        <img
          :src="userData.picture"
          :alt="userData.name || 'User'"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-else
        class="p-2 w-full h-full bg-gradient-to-bl from-gray-100 to-gray-500 rounded-full flex items-center justify-center"
      >
        <span class="text-white text-sm font-medium">{{ userInitials }}</span>
      </div>

      <!-- User Name -->
      <div class="flex-1 mx-2">
        <span class="text-sm font-medium text-gray-700 truncate">
          {{ userData?.name || "User" }}
        </span>
        <div v-if="userData?.email" class="text-xs text-gray-500 truncate">
          {{ userData.email }}
        </div>
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

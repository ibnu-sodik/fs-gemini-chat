<script setup lang="ts">
import { ref } from "vue";
import ChatSidebar from "@/components/ChatSidebar.vue";

const isSidebarOpen = ref(false);
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <ChatSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col h-full min-h-0">
      <!-- Navbar/Header (mobile & desktop) -->
      <header
        class="flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-xl"
      >
        <div class="flex items-center gap-2">
          <button
            @click="toggleSidebar"
            class="md:hidden text-gray-600 hover:text-gray-900"
          >
            ☰
          </button>
          <span class="font-semibold text-gray-900">Gemini Chat</span>
        </div>
        <!-- Desktop navigation -->
        <div class="hidden md:flex items-center gap-4">
          <NuxtLink
            to="/"
            class="text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md transition-colors"
          >
            ← Back to Home
          </NuxtLink>
        </div>
      </header>

      <!-- Main content area -->
      <div class="flex-1 min-h-0">
        <!-- Empty state - no session selected -->
        <div class="h-full flex items-center justify-center bg-gray-50">
          <div class="text-center max-w-md mx-auto p-8">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Gemini Chat
            </h2>
            <p class="text-gray-600 mb-6">
              Select a chat session from the sidebar to continue an existing
              conversation, or create a new one to get started.
            </p>
            <div class="space-y-3">
              <button
                @click="isSidebarOpen = true"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors md:hidden"
              >
                Open Chat Sessions
              </button>
              <p class="text-sm text-gray-500 hidden md:block">
                Use the sidebar to select or create a chat session
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

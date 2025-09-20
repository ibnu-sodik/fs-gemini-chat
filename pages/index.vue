<script setup lang="ts">
import { ref } from "vue";
import ChatSidebar from "@/components/ChatSidebar.vue";
import ChatWindow from "@/components/ChatWindow.vue";

const isSidebarOpen = ref(false);
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <ChatSidebar
      :is-open="isSidebarOpen"
      @close="isSidebarOpen = false"
      class="w-64 flex-shrink-0"
    />

    <!-- Main content -->
    <div class="flex-1 flex flex-col h-full min-h-0">
      <!-- Header (mobile only) -->
      <header
        class="md:hidden flex items-center justify-between p-4 border-b bg-white"
      >
        <button
          @click="toggleSidebar"
          class="text-gray-600 hover:text-gray-900"
        >
          ☰
        </button>
        <h1 class="font-semibold text-lg text-gray-800">ChatBot GoBlog</h1>
      </header>

      <!-- Chat window -->
      <div class="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  </div>
</template>

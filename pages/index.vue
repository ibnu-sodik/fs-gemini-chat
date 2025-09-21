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
          <span class="font-semibold text-transparent">Gemini Chat</span>
        </div>
        <!-- Tambahkan menu/aksi lain di desktop jika perlu -->
        <div class="hidden md:flex items-center gap-4">
          <!-- Contoh: tombol profil, settings, dll -->
          <!-- <button class="text-gray-600 hover:text-gray-900">Profile</button> -->
        </div>
      </header>

      <!-- Chat window -->
      <div class="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  </div>
</template>

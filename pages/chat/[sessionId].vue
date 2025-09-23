<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { toast } from "vue3-toastify";
import ChatSidebar from "@/components/ChatSidebar.vue";
import ChatWindow from "@/components/ChatWindow.vue";
import { useChat } from "@/composables/useChat";

// Get session ID from route params
const route = useRoute();
const router = useRouter();
const sessionId = computed(() => route.params.sessionId as string);

// Initialize chat with specific session
const { setActiveSession, activeSessionId, messages, sessions } = useChat();

// Set active session when component mounts or route changes
watch(
  () => route.params.sessionId,
  async (newSessionId) => {
    if (newSessionId) {
      try {
        await setActiveSession(newSessionId as string);

        // Check if session exists in sessions list (after a small delay to let sessions load)
        setTimeout(() => {
          const exists = sessions.value.some((s) => s.id === newSessionId);
          if (!exists && sessions.value.length > 0) {
            // Show toast error first
            toast.error(`Unable to load conversation ${newSessionId}`, {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
            });

            // Then redirect after a delay to let user see the toast
            setTimeout(() => {
              router.push("/chat");
            }, 2000);
          }
        }, 1000);
      } catch (error) {
        // Show toast error first
        toast.error(`Unable to load conversation ${newSessionId}`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });

        // Then redirect after a delay to let user see the toast
        setTimeout(() => {
          router.push("/chat");
        }, 2000);
      }
    }
  },
  { immediate: true }
);

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
          <span class="font-semibold text-gray-900">Nuxt Gemini Chatbot</span>
        </div>
        <!-- Desktop navigation -->
        <div class="hidden md:flex items-center gap-4">
          <NuxtLink
            to="/"
            class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md transition-colors"
          >
            ← Back to Home
          </NuxtLink>
        </div>
      </header>

      <!-- Main content area -->
      <div class="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  </div>
</template>

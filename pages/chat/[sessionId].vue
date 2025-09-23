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

// Get app name from runtime config
const { $config } = useNuxtApp();
const appName = $config.public.appName;
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
            class="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
            type="button"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <span class="font-semibold text-gray-900">{{ appName }}</span>
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

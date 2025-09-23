<script setup lang="ts">
import { useChat } from "@/composables/useChat";
import { watch, nextTick } from "vue";
import SessionItem from "./SessionItem.vue";

const emit = defineEmits(["close", "sessionDelete"]);

const { sessions, activeSessionId, isTypingTitle } = useChat();

// State for scroll effects
const chatSessionsRef = ref<HTMLElement | null>(null);
const isScrolled = ref(false);
const SCROLL_STORAGE_KEY = "sidebar-scroll-position";

// Get saved scroll position from session storage
const getSavedScrollPosition = () => {
  try {
    const saved = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    return saved ? parseInt(saved) : 0;
  } catch {
    return 0;
  }
};

// Save scroll position to session storage
const saveScrollPosition = (position: number) => {
  try {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, position.toString());
  } catch {
    // Ignore storage errors
  }
};

function handleSessionSelect(sessionId: string) {
  // Save current scroll position before navigation
  if (chatSessionsRef.value) {
    saveScrollPosition(chatSessionsRef.value.scrollTop);
  }

  // Navigate to specific chat session
  navigateTo(`/chat/${sessionId}`);
  emit("close"); // auto close sidebar di mobile
}

function handleSessionDelete(session: { id: string; title: string }) {
  emit("sessionDelete", session);
}

function handleSessionRename(data: { sessionId: string; newTitle: string }) {
  // Handle rename if needed (already handled by SessionItem internally)
  console.log("Session renamed:", data);
}

function handleChatSessionsScroll() {
  if (chatSessionsRef.value) {
    isScrolled.value = chatSessionsRef.value.scrollTop > 0;
    // Save scroll position in real-time
    saveScrollPosition(chatSessionsRef.value.scrollTop);
  }
}

onMounted(() => {
  if (chatSessionsRef.value) {
    chatSessionsRef.value.addEventListener("scroll", handleChatSessionsScroll);

    // Restore scroll position after component mounts
    nextTick(() => {
      if (chatSessionsRef.value) {
        const savedPosition = getSavedScrollPosition();
        if (savedPosition > 0) {
          chatSessionsRef.value.scrollTop = savedPosition;
        }
      }
    });
  }
});

// Watch for sessions changes and restore scroll position
watch(
  sessions,
  () => {
    nextTick(() => {
      if (chatSessionsRef.value) {
        const savedPosition = getSavedScrollPosition();
        if (savedPosition > 0) {
          chatSessionsRef.value.scrollTop = savedPosition;
        }
      }
    });
  },
  { flush: "post" }
);

// Watch activeSessionId changes but DON'T auto-scroll to active item
// This prevents unwanted scrolling when user clicks on sessions
watch(
  activeSessionId,
  () => {
    // We intentionally do nothing here to preserve scroll position
    // Users should manually scroll to see their active session if needed
  },
  { immediate: false }
);

onUnmounted(() => {
  if (chatSessionsRef.value) {
    chatSessionsRef.value.removeEventListener(
      "scroll",
      handleChatSessionsScroll
    );
  }
});
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Fixed Menu dengan Shadow saat scroll -->
    <div
      :class="[
        'px-4 py-2 bg-white transition-shadow duration-200',
        isScrolled ? 'shadow-sm border-b border-gray-100' : '',
      ]"
    >
      <span class="pl-0 py-1 text-xs text-gray-500 block">Chats</span>
    </div>

    <!-- Chat Sessions List -->
    <div
      ref="chatSessionsRef"
      class="flex-1 overflow-y-auto pt-1 pb-4"
      style="min-height: 0"
    >
      <!-- Empty State -->
      <div v-if="sessions.length === 0" class="px-4 py-8 text-center">
        <div class="text-gray-400 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-8 h-8 mx-auto"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </div>
        <p class="text-sm text-gray-500">No chats yet</p>
        <p class="text-xs text-gray-400 mt-1">Start a new conversation</p>
      </div>

      <!-- Sessions List -->
      <div v-else class="space-y-1">
        <SessionItem
          v-for="session in sessions"
          :key="session.id"
          :session="session"
          :isActive="session.id === activeSessionId"
          :isTyping="isTypingTitle === session.id"
          @select="handleSessionSelect"
          @delete="handleSessionDelete"
          @rename="handleSessionRename"
        />
      </div>
    </div>
  </div>
</template>

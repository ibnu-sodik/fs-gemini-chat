<script setup lang="ts">
import { useChat } from "@/composables/useChat";

const emit = defineEmits(["close"]);

const { newChat } = useChat();
const isCreatingNewChat = ref(false);
let debounceTimeout: NodeJS.Timeout | null = null;

async function createNewChatWithLoading() {
  if (isCreatingNewChat.value) return; // Prevent if already creating

  isCreatingNewChat.value = true;

  try {
    const sessionId = await newChat();
    if (sessionId) {
      navigateTo(`/chat/${sessionId}`);
      emit("close");
    }
  } catch (error) {
    console.error("Error creating new chat:", error);
    // Optional: Show error toast
    // toast.error("Failed to create new chat");
  } finally {
    isCreatingNewChat.value = false;
  }
}

function handleNewChat() {
  // Clear previous debounce timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  // Set new debounce timeout
  debounceTimeout = setTimeout(() => {
    createNewChatWithLoading();
  }, 300); // 300ms debounce delay
}

function handleSearchChats() {
  // TODO: Implement search chats functionality
  console.log("Search chats clicked");
}
</script>

<template>
  <div class="p-4 space-y-3">
    <!-- Search Button -->
    <button
      @click="handleSearchChats"
      class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
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
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <span>Search chats</span>
    </button>

    <!-- New Chat Button -->
    <button
      @click="handleNewChat"
      :disabled="isCreatingNewChat"
      class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        v-if="isCreatingNewChat"
        class="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <svg
        v-else
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
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      <span>{{ isCreatingNewChat ? "Creating..." : "New chat" }}</span>
    </button>
  </div>
</template>

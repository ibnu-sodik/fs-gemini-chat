<script setup lang="ts">
import { useChat } from "@/composables/useChat";

interface Props {
  isOpen: boolean;
  session: { id: string; title: string } | null;
}

const props = defineProps<Props>();
const emit = defineEmits(["close", "confirm"]);

const { deleteSession, activeSessionId } = useChat();
const isDeletingSession = ref(false);
let deleteDebounceTimeout: NodeJS.Timeout | null = null;

async function deleteSessionWithLoading() {
  if (!props.session || isDeletingSession.value) return; // Prevent if already deleting

  isDeletingSession.value = true;

  try {
    const isActiveSession = props.session.id === activeSessionId.value;

    await deleteSession(props.session.id);

    // Emit confirm event to parent
    emit("confirm", { sessionId: props.session.id, isActiveSession });
  } catch (error) {
    console.error("Error deleting session:", error);
    // Optional: Show error toast
    // toast.error("Failed to delete chat session");
  } finally {
    isDeletingSession.value = false;
    emit("close");
  }
}

function confirmDelete() {
  // Clear previous debounce timeout
  if (deleteDebounceTimeout) {
    clearTimeout(deleteDebounceTimeout);
  }

  // Set new debounce timeout
  deleteDebounceTimeout = setTimeout(() => {
    deleteSessionWithLoading();
  }, 300); // 300ms debounce delay
}

function cancelDelete() {
  // Clear delete debounce timeout when canceling
  if (deleteDebounceTimeout) {
    clearTimeout(deleteDebounceTimeout);
  }

  isDeletingSession.value = false; // Reset loading state
  emit("close");
}
</script>

<template>
  <!-- Delete Confirmation Modal -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="!isDeletingSession && cancelDelete()"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Delete chat?</h3>

      <p class="text-gray-600 mb-6">
        This will delete
        <span class="font-medium text-gray-900">"{{ session?.title }}"</span>
      </p>

      <div class="flex gap-3 justify-end">
        <button
          @click="cancelDelete"
          :disabled="isDeletingSession"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          @click="confirmDelete"
          :disabled="isDeletingSession"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 cursor-pointer rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            v-if="isDeletingSession"
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
          {{ isDeletingSession ? "Deleting..." : "Delete" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChat } from "@/composables/useChat";
import { nextTick, onMounted, onUnmounted } from "vue";

defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits(["close"]);
const {
  sessions,
  activeSessionId,
  newChat,
  updateSession,
  deleteSession,
  isTypingTitle,
} = useChat();

// State untuk mengontrol dropdown options
const showOptionsId = ref<string | null>(null);
const editingSessionId = ref<string | null>(null);
const editingTitle = ref("");
const showDeleteModal = ref(false);
const sessionToDelete = ref<{ id: string; title: string } | null>(null);
const sidebarRef = ref<HTMLElement | null>(null);

function handleSelect(id: string) {
  // Navigate to specific chat session
  navigateTo(`/chat/${id}`);
  emit("close"); // auto close sidebar di mobile
}

async function handleNewChat() {
  const sessionId = await newChat();
  if (sessionId) {
    navigateTo(`/chat/${sessionId}`);
    emit("close");
  }
}

function toggleOptions(sessionId: string) {
  showOptionsId.value = showOptionsId.value === sessionId ? null : sessionId;
}

function startRename(session: any) {
  editingSessionId.value = session.id;
  editingTitle.value = session.title;
  showOptionsId.value = null;

  // Use nextTick and setTimeout to ensure DOM is updated before focusing
  nextTick(() => {
    setTimeout(() => {
      // Query the input element directly by looking for the focused input
      const inputElement = document.querySelector(
        'input[data-editing="true"]'
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.setSelectionRange(0, inputElement.value.length);
      }
    }, 50); // Increase timeout to 50ms
  });
}

async function confirmRename() {
  if (editingSessionId.value && editingTitle.value.trim()) {
    await updateSession(editingSessionId.value, {
      title: editingTitle.value.trim(),
    });
    editingSessionId.value = null;
    editingTitle.value = "";
  }
}

function cancelRename() {
  editingSessionId.value = null;
  editingTitle.value = "";
}

async function handleDelete(sessionId: string) {
  const session = sessions.value.find((s) => s.id === sessionId);
  if (session) {
    sessionToDelete.value = session;
    showDeleteModal.value = true;
    showOptionsId.value = null;
  }
}

async function confirmDelete() {
  if (sessionToDelete.value) {
    const isActiveSession = sessionToDelete.value.id === activeSessionId.value;

    try {
      await deleteSession(sessionToDelete.value.id);

      // Reset modal state first
      showDeleteModal.value = false;
      sessionToDelete.value = null;

      // Jika session yang dihapus adalah session aktif, redirect ke home
      if (isActiveSession) {
        // Add small delay to ensure state is cleared
        await new Promise((resolve) => setTimeout(resolve, 100));
        await navigateTo("/chat");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      // Reset modal state even on error
      showDeleteModal.value = false;
      sessionToDelete.value = null;
    }
  }
}

function cancelDelete() {
  showDeleteModal.value = false;
  sessionToDelete.value = null;
}

function handleLogout() {
  // TODO: Implement logout functionality
  console.log("Logout clicked");
}

function handleSearchChats() {
  // TODO: Implement search chats functionality
  console.log("Search chats clicked");
}

// Close options when clicking outside
function closeOptions() {
  showOptionsId.value = null;
}

// Global click handler to close options when clicking outside dropdown
function handleGlobalClick(event: MouseEvent) {
  if (showOptionsId.value) {
    // Find the dropdown element
    const dropdownElement = document.querySelector(".absolute.right-0.top-8");
    const optionsButton = document.querySelector(
      `[data-session-id="${showOptionsId.value}"]`
    );

    // Check if click is outside both dropdown and its trigger button
    const isClickOutsideDropdown =
      dropdownElement && !dropdownElement.contains(event.target as Node);
    const isClickOutsideButton =
      optionsButton && !optionsButton.contains(event.target as Node);

    if (isClickOutsideDropdown && isClickOutsideButton) {
      closeOptions();
    }
  }
}

// Setup global click listener
onMounted(() => {
  document.addEventListener("click", handleGlobalClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleGlobalClick);
});
</script>

<template>
  <div>
    <!-- Overlay untuk mobile -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 z-30 md:hidden"
      @click="$emit('close')"
    ></div>

    <aside
      ref="sidebarRef"
      :class="[
        'fixed md:static top-0 left-0 h-full w-64 bg-gray-50 flex flex-col border-r border-gray-200 z-40 transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <!-- Navbar Sidebar -->
      <div
        class="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3 mt-1 sm:mt-0 sm:p-4 md:p-5"
      >
        <!-- Logo kiri -->
        <div class="flex items-center gap-2">
          <img src="/favicon.ico" alt="Logo" class="h-5 w-5" />
          <span class="font-semibold text-gray-800">&nbsp;</span>
        </div>
        <!-- Tombol silang kanan (hanya mobile) -->
        <button
          v-if="isOpen"
          class="md:hidden text-gray-500 hover:text-gray-800 text-xl"
          @click="$emit('close')"
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </div>

      <div class="px-2 py-2">
        <!-- New Chat Button -->
        <button
          @click="handleNewChat"
          class="w-full pl-3 pr-2 py-1.5 rounded flex items-center justify-start gap-2 cursor-pointer hover:bg-gray-200 text-gray-700 text-sm transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="16px"
            viewBox="0 -960 960 960"
            width="16px"
            fill="currentColor"
          >
            <path
              d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z"
            />
          </svg>
          <span class="text-sm font-medium">New Chat</span>
        </button>

        <!-- Search Chats Button -->
        <button
          @click="handleSearchChats"
          class="w-full pl-3 pr-2 py-1.5 rounded flex items-center justify-start gap-2 cursor-pointer hover:bg-gray-200 text-gray-700 text-sm transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="16px"
            viewBox="0 -960 960 960"
            width="16px"
            fill="currentColor"
          >
            <path
              d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"
            />
          </svg>
          <span class="text-sm font-medium">Search chats</span>
        </button>
      </div>

      <!-- Chat Sessions -->
      <div class="flex-1 overflow-y-auto space-y-0.5">
        <span class="pl-4 py-1 text-xs text-gray-500 block">Chats</span>
        <div
          v-for="s in sessions"
          :key="s.id"
          :class="[
            'relative group pl-3 pr-2 py-1.5 mx-1 rounded cursor-pointer transition-colors flex items-center justify-between text-sm',
            s.id === activeSessionId
              ? 'bg-gray-300/70 text-gray-800'
              : editingSessionId === s.id
                ? 'bg-gray-200 text-gray-700'
                : 'hover:bg-gray-200 text-gray-700',
          ]"
        >
          <!-- Session Title atau Input Edit -->
          <div
            v-if="editingSessionId !== s.id"
            @click="handleSelect(s.id)"
            class="flex-1 truncate flex items-center gap-2"
          >
            <span class="text-sm">{{ s.title }}</span>
            <!-- Typing Indicator untuk Auto-Rename -->
            <div v-if="isTypingTitle === s.id" class="flex items-center gap-1">
              <div class="flex space-x-1">
                <div
                  class="w-0.5 h-0.5 bg-gray-500 rounded-full animate-bounce"
                  style="animation-delay: 0ms"
                ></div>
                <div
                  class="w-0.5 h-0.5 bg-gray-500 rounded-full animate-bounce"
                  style="animation-delay: 150ms"
                ></div>
                <div
                  class="w-0.5 h-0.5 bg-gray-500 rounded-full animate-bounce"
                  style="animation-delay: 300ms"
                ></div>
              </div>
            </div>
          </div>

          <!-- Edit Input -->
          <div v-else class="flex-1 flex items-center gap-2" @click.stop>
            <input
              data-editing="true"
              v-model="editingTitle"
              @keyup.enter="confirmRename"
              @keyup.escape="cancelRename"
              @blur="confirmRename"
              class="flex-1 p-0 text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0"
            />
          </div>

          <!-- Options Button - Hidden saat editing -->
          <div v-if="editingSessionId !== s.id" class="relative">
            <button
              @click.stop="toggleOptions(s.id)"
              :data-session-id="s.id"
              :class="[
                'p-1 rounded hover:bg-gray-300 transition-colors cursor-pointer',
                'md:opacity-0 md:group-hover:opacity-100 opacity-100',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="14px"
                viewBox="0 -960 960 960"
                width="14px"
                fill="currentColor"
              >
                <path
                  d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"
                />
              </svg>
            </button>

            <!-- Options Dropdown -->
            <div
              v-if="showOptionsId === s.id"
              class="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[120px]"
              @click.stop
            >
              <button
                @click="startRename(s)"
                class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16px"
                  viewBox="0 -960 960 960"
                  width="16px"
                  fill="currentColor"
                >
                  <path
                    d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
                  />
                </svg>
                Rename
              </button>
              <button
                @click="handleDelete(s.id)"
                class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16px"
                  viewBox="0 -960 960 960"
                  width="16px"
                  fill="currentColor"
                >
                  <path
                    d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Profile Section -->
      <div class="p-4 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center gap-3">
          <!-- User Avatar -->
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <span class="text-white text-sm font-medium">JD</span>
            </div>
          </div>

          <!-- User Name -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">John Doe</p>
            <p class="text-xs text-gray-500 truncate">john.doe@example.com</p>
          </div>

          <!-- Logout Button -->
          <div class="flex-shrink-0">
            <button
              @click="handleLogout"
              class="p-2 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              title="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="16px"
                viewBox="0 -960 960 960"
                width="16px"
                fill="currentColor"
              >
                <path
                  d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="cancelDelete"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Delete chat?</h3>

        <p class="text-gray-600 mb-6">
          This will delete
          <span class="font-medium text-gray-900"
            >"{{ sessionToDelete?.title }}"</span
          >
        </p>

        <div class="flex gap-3 justify-end">
          <button
            @click="cancelDelete"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 cursor-pointer rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

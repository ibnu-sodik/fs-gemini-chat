<script setup lang="ts">
import { useChat } from "@/composables/useChat";
import { nextTick } from "vue";

interface Props {
  session: {
    id: string;
    title: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  isActive: boolean;
  isTyping: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["select", "delete", "rename"]);

const { updateSession } = useChat();

// Local state for this session item
const showOptions = ref(false);
const isEditing = ref(false);
const editingTitle = ref("");

function handleSelect() {
  emit("select", props.session.id);
}

function toggleOptions() {
  showOptions.value = !showOptions.value;
}

function handleRename() {
  editingTitle.value = props.session.title;
  isEditing.value = true;
  showOptions.value = false;

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
  if (isEditing.value && editingTitle.value.trim()) {
    await updateSession(props.session.id, {
      title: editingTitle.value.trim(),
    });
    emit("rename", {
      sessionId: props.session.id,
      newTitle: editingTitle.value.trim(),
    });
  }
  isEditing.value = false;
  editingTitle.value = "";
}

function cancelRename() {
  isEditing.value = false;
  editingTitle.value = "";
}

function handleDelete() {
  emit("delete", props.session);
  showOptions.value = false;
}

// Close options when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest(`[data-session-id="${props.session.id}"]`)) {
    showOptions.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    :class="[
      'relative group pl-3 pr-2 py-1.5 mx-1 rounded cursor-pointer transition-colors flex items-center justify-between text-sm',
      isActive
        ? 'bg-gray-300/70 text-gray-800'
        : isEditing
          ? 'bg-gray-200 text-gray-700'
          : 'hover:bg-gray-200 text-gray-700',
    ]"
  >
    <!-- Session Title atau Input Edit -->
    <div
      v-if="!isEditing"
      @click="handleSelect"
      class="flex-1 truncate flex items-center gap-2"
    >
      <span class="text-sm">{{ session.title }}</span>
      <!-- Typing Indicator untuk Auto-Rename -->
      <div v-if="isTyping" class="flex items-center gap-1">
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
    <div v-if="!isEditing" class="relative">
      <button
        @click.stop="toggleOptions"
        :data-session-id="session.id"
        :class="[
          'p-1 rounded hover:bg-gray-300 transition-colors cursor-pointer',
          'md:opacity-0 md:group-hover:opacity-100 opacity-100',
        ]"
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
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
      </button>

      <!-- Options Dropdown -->
      <div
        v-if="showOptions"
        :data-session-id="session.id"
        class="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10"
      >
        <button
          @click="handleRename"
          class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
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
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          Rename
        </button>
        <button
          @click="handleDelete"
          class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2"
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
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

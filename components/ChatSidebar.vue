<script setup lang="ts">
import { useChat } from "@/composables/useChat";

defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits(["close"]);
const { sessions, activeSessionId, setActive, newChat } = useChat();

function handleSelect(id: string) {
  setActive(id);
  emit("close"); // auto close sidebar di mobile
}
</script>

<template>
  <!-- Overlay untuk mobile -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/40 z-30 md:hidden"
    @click="$emit('close')"
  ></div>

  <aside
    :class="[
      'fixed md:static top-0 left-0 h-full w-64 bg-gray-100 p-4 flex flex-col border-r border-gray-200 z-40 transition-transform duration-300',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]"
  >
    <!-- New Chat Button -->
    <button
      @click="newChat"
      class="mb-4 p-2 rounded flex items-center justify-start gap-2 cursor-pointer hover:bg-gray-200 text-gray-700"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="20px"
        viewBox="0 -960 960 960"
        width="20px"
        fill="#000"
      >
        <path
          d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z"
        />
      </svg>
      <span>New Chat</span>
    </button>

    <!-- Chat Sessions -->
    <div class="flex-1 overflow-y-auto space-y-1">
      <div
        v-for="s in sessions"
        :key="s.id"
        @click="handleSelect(s.id)"
        :class="[
          'p-2 rounded cursor-pointer transition-colors',
          s.id === activeSessionId
            ? 'bg-gray-300/70 text-gray-800'
            : 'hover:bg-gray-200 text-gray-700',
        ]"
      >
        {{ s.title }}
      </div>
    </div>
  </aside>
</template>

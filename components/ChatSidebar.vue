<script setup lang="ts">
import { useChat } from "@/composables/useChat";

defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits(["close"]);
const { sessions, activeSessionId, setActive, newChat } = useChat("");

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
      'fixed md:static top-0 left-0 h-full w-64 bg-white p-4 flex flex-col border-r border-gray-200 z-40 transition-transform duration-300',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]"
  >
    <!-- New Chat Button -->
    <button
      @click="newChat"
      class="mb-4 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
      + New Chat
    </button>

    <!-- Chat Sessions -->
    <div class="flex-1 overflow-y-auto space-y-2">
      <div
        v-for="s in sessions"
        :key="s.id"
        @click="handleSelect(s.id)"
        :class="[
          'p-2 rounded cursor-pointer transition-colors',
          s.id === activeSessionId
            ? 'bg-blue-100 text-blue-900 font-medium'
            : 'hover:bg-gray-100 text-gray-700',
        ]"
      >
        {{ s.title }}
      </div>
    </div>
  </aside>
</template>

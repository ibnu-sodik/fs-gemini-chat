<script setup lang="ts">
import { ref } from "vue";

const messages = ref([
  { id: 1, role: "user", content: "Halo Gemini 👋" },
  {
    id: 2,
    role: "assistant",
    content: "Hai! Ada yang bisa saya bantu hari ini?",
  },
]);

const input = ref("");
function sendMessage() {
  if (!input.value.trim()) return;
  messages.value.push({ id: Date.now(), role: "user", content: input.value });
  input.value = "";
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      <div
        v-for="m in messages"
        :key="m.id"
        :class="[
          'max-w-md px-4 py-2 rounded-lg shadow',
          m.role === 'user'
            ? 'ml-auto bg-blue-600 text-white'
            : 'mr-auto bg-gray-100 text-gray-900',
        ]"
      >
        {{ m.content }}
      </div>
    </div>

    <!-- Input Box -->
    <form
      @submit.prevent="sendMessage"
      class="p-4 border-t border-gray-200 flex gap-2"
    >
      <input
        v-model="input"
        type="text"
        placeholder="Ketik pesan..."
        class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Kirim
      </button>
    </form>
  </div>
</template>

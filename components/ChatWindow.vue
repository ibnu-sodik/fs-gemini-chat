<script setup lang="ts">
import { ref } from "vue";

const messages = ref<{ id: string; role: string; content: string }[]>([]);
const input = ref("");
const isLoading = ref(false);

async function sendMessage() {
  if (!input.value.trim()) return;
  isLoading.value = true;
  // Tambahkan pesan user ke UI
  messages.value.push({
    id: "u-" + Date.now(),
    role: "user",
    content: input.value,
  });

  // Kirim ke backend
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: input.value }),
  });
  const data = await res.json();

  // Tambahkan response AI ke UI
  messages.value.push({
    id: "a-" + Date.now(),
    role: "assistant",
    content: data.response,
  });
  input.value = "";
  isLoading.value = false;
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
      class="p-4 border-t border-gray-200 flex gap-2"
      @submit.prevent="sendMessage"
    >
      <input
        v-model="input"
        @keyup.enter.prevent="sendMessage"
        type="text"
        placeholder="Ketik pesan..."
        class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        :disabled="isLoading"
      />
      <button
        type="submit"
        :disabled="isLoading"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {{ isLoading ? "Loading..." : "Send" }}
      </button>
    </form>
  </div>
</template>

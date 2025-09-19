<script setup lang="ts">
import { marked } from "marked";
import { useChat } from "@/composables/useChat";
const { messages, input, send, isLoading } = useChat("default-session");

function handleEnter(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    send();
  }
}

function formatAI(text: string) {
  return marked.parse(text);
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
          'px-4 py-2 rounded-lg shadow w-fit max-w-[80vw] md:max-w-xl',
          m.role === 'user'
            ? 'ml-auto bg-blue-600 text-white'
            : 'mr-auto bg-gray-100 text-gray-900',
          m.role === 'assistant' ? 'break-words' : '',
        ]"
      >
        <span v-if="m.role === 'user'">{{ m.content }}</span>
        <span v-else v-html="formatAI(m.content)"></span>
      </div>
    </div>

    <!-- Input Box -->
    <form
      class="p-4 border-t border-gray-200 flex gap-2"
      @submit.prevent="send"
    >
      <textarea
        v-model="input"
        @keydown.enter="handleEnter"
        placeholder="Ketik pesan..."
        class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px]"
        :disabled="isLoading"
        rows="2"
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

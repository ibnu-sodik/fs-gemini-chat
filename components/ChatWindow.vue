<script setup lang="ts">
import { marked } from "marked";
import { useChat } from "@/composables/useChat";
import { nextTick, ref, watch } from "vue";
const { messages, input, send, isLoading } = useChat();

const chatListRef = ref<HTMLElement | null>(null);

function handleEnter(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    send();
  }
}

function formatAI(text: string) {
  return marked.parse(text);
}

watch(messages, async () => {
  await nextTick();
  if (chatListRef.value) {
    chatListRef.value.scrollTop = chatListRef.value.scrollHeight;
  }
});
</script>

<template>
  <div class="relative h-full bg-white flex flex-col">
    <!-- Chat Messages -->
    <div ref="chatListRef" class="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
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
        <span v-else-if="m.id === 'loading'">
          <span class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span class="text-gray-500">Gemini is typing...</span>
          </span>
        </span>
        <span v-else v-html="formatAI(m.content)"></span>
      </div>
    </div>

    <!-- Input Box sticky/fixed at bottom -->
    <form
      class="absolute left-0 right-0 bottom-0 p-4 border-t border-gray-200 bg-white flex gap-2"
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

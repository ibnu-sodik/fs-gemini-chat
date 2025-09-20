<script setup lang="ts">
import { marked } from "marked";
import { useChat } from "@/composables/useChat";
import { nextTick, ref, watch } from "vue";
const { messages, input, send, isLoading } = useChat();

const chatListRef = ref<HTMLElement | null>(null);
const displayedContent = ref<{ [id: string]: string }>({});

function scrollToBottom() {
  nextTick(() => {
    setTimeout(() => {
      if (chatListRef.value) {
        chatListRef.value.scrollTop = chatListRef.value.scrollHeight;
      }
    }, 50);
  });
}

function handleEnter(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    send();
    scrollToBottom();
  }
}

function formatAI(text: string) {
  return marked.parse(text);
}

// Animasi typing untuk pesan Gemini
function animateMessage(id: string, content: string) {
  displayedContent.value[id] = "";
  let i = 0;
  const interval = setInterval(() => {
    displayedContent.value[id] += content[i];
    i++;
    scrollToBottom();
    if (i >= content.length) clearInterval(interval);
  }, 20); // 20ms per huruf, bisa diubah
}

// Animasi per kata:
// function animateMessage(id: string, content: string) {
//   const words = content.split(" ");
//   displayedContent.value[id] = "";
//   let i = 0;
//   const interval = setInterval(() => {
//     displayedContent.value[id] += (i > 0 ? " " : "") + words[i];
//     i++;
//     scrollToBottom();
//     if (i >= words.length) clearInterval(interval);
//   }, 150); // 150ms per kata
// }

// Animasi per kalimat:
// function animateMessage(id: string, content: string) {
//   const sentences = content.split(/([.!?])\s*/);
//   displayedContent.value[id] = "";
//   let i = 0;
//   const interval = setInterval(() => {
//     displayedContent.value[id] += sentences[i];
//     i++;
//     scrollToBottom();
//     if (i >= sentences.length) clearInterval(interval);
//   }, 300); // 300ms per kalimat
// }

watch(messages, (newMessages, oldMessages) => {
  scrollToBottom();

  // Isi semua pesan lama ke displayedContent (langsung tampil penuh)
  newMessages.forEach((msg) => {
    if (!msg.isAIResponse) {
      displayedContent.value[msg.id] = msg.content;
    }
  });

  // Animasi hanya untuk pesan Gemini terbaru
  const lastMsg = newMessages[newMessages.length - 1];
  if (
    lastMsg &&
    lastMsg.role === "assistant" &&
    lastMsg.isAIResponse &&
    !displayedContent.value[lastMsg.id]
  ) {
    animateMessage(lastMsg.id, lastMsg.content);
  }
});
</script>

<template>
  <div class="h-full bg-white flex flex-col">
    <!-- Chat Messages -->
    <div
      ref="chatListRef"
      class="flex-1 overflow-y-auto p-6 space-y-4"
      style="min-height: 0"
    >
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
        <span
          v-else-if="m.role === 'assistant'"
          v-html="formatAI(displayedContent[m.id] || '')"
        ></span>
      </div>
    </div>

    <!-- Input Box di bawah, tidak absolute -->
    <form
      class="p-4 border-t border-gray-200 bg-white flex gap-2"
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

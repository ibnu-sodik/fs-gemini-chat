<script setup lang="ts">
import { marked } from "marked";
import { useChat } from "@/composables/useChat";
import { nextTick, ref, watch } from "vue";
const { messages, input, send, isLoading } = useChat();

const chatListRef = ref<HTMLElement | null>(null);
const displayedContent = ref<{ [id: string]: string }>({});
const inputRef = ref<HTMLTextAreaElement | null>(null);

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

function resizeTextarea() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 192) + "px";
  el.style.overflowY = el.scrollHeight > 192 ? "auto" : "hidden";
}
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
          'px-4 py-2 w-fit ',
          m.role === 'user'
            ? 'max-w-[80vw] md:max-w-xl rounded-lg shadow ml-auto bg-gray-200 text-gray-900'
            : 'mr-auto',
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
    <form class="px-4 pb-4" @submit.prevent="send">
      <div class="border rounded-lg px-2 py-2 bg-white">
        <textarea
          v-model="input"
          @keydown.enter="handleEnter"
          @input="resizeTextarea"
          ref="inputRef"
          placeholder="Ketik pesan..."
          class="w-full border-none outline-none px-2 py-2 resize-none min-h-[40px] max-h-[192px] overflow-y-auto bg-transparent"
          :disabled="isLoading"
          rows="1"
          style="line-height: 1.5"
        />
        <div class="flex justify-end mt-2">
          <button
            type="submit"
            :disabled="isLoading"
            :class="[
              'flex items-center justify-center w-10 h-10 text-white rounded-full cursor-pointer shadow-md',
              isLoading ? 'bg-gray-200/70' : 'bg-black',
            ]"
            title="Kirim"
          >
            <svg
              v-if="isLoading"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              class="h-5 w-5"
              fill="#000"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M320-640v320-320Zm-80 400v-480h480v480H240Zm80-80h320v-320H320v320Z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 -960 960 960"
              fill="#fff"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

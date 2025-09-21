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
    <form class="px-4 pb-4 pt-1 shadow-xl" @submit.prevent="send">
      <div class="border rounded-lg px-2 py-2">
        <textarea
          v-model="input"
          @keydown.enter="handleEnter"
          @input="resizeTextarea"
          ref="inputRef"
          placeholder="Ketik pesan..."
          class="w-full border-none outline-none px-2 resize-none min-h-[40px] max-h-[192px] overflow-y-auto bg-transparent"
          :disabled="isLoading"
          rows="1"
          style="line-height: 1.5"
        />

        <div class="flex flex-row justify-between items-center">
          <div class="flex justify-start mt-2">
            <button
              @click="optionFiles"
              class="flex items-center justify-center w-7 h-7 rounded-full cursor-pointer hover:bg-gray-200"
              title="Add Files and more /"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 stroke-2 text-gray-900"
                viewBox="0 -960 960 960"
                fill="#000"
              >
                <path
                  d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
                />
              </svg>
            </button>

            <div class="ml-2">
              <label for="model-switcher" class="text-xs text-gray-500 mr-2">
                Model:
              </label>
              <select
                id="model-switcher"
                v-model="selectedModel"
                class="border rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option
                  v-for="opt in modelOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
          <div></div>
          <div class="flex justify-end mt-2">
            <button
              type="submit"
              :disabled="isLoading"
              :class="[
                'flex items-center justify-center w-7 h-7 text-white rounded-full cursor-pointer shadow-md',
                isLoading ? 'bg-gray-200/70' : 'bg-black',
              ]"
              title="Kirim"
            >
              <svg
                v-if="isLoading"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                class="h-3 w-3 animate-ping"
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
                class="h-3 w-3 stroke-2"
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
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { marked } from "marked";
import { useChat } from "@/composables/useChat";
import { nextTick, ref, watch } from "vue";
const { messages, input, send, isLoading, setModel } = useChat();

const chatListRef = ref<HTMLElement | null>(null);
const displayedContent = ref<{ [id: string]: string }>({});
const inputRef = ref<HTMLTextAreaElement | null>(null);

const modelOptions = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
];
const selectedModel = ref(modelOptions[0].value);

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

watch(selectedModel, (val) => {
  console.log(val);
  if (val !== undefined) {
    setModel(val);
  }
});

onMounted(() => {
  setModel(selectedModel.value);
});

function resizeTextarea() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 192) + "px";
  el.style.overflowY = el.scrollHeight > 192 ? "auto" : "hidden";
}

function optionFiles() {
  alert("Feature in development...");
}
</script>

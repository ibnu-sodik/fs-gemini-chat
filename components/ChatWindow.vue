<template>
  <div class="h-full bg-white flex flex-col relative">
    <!-- Chat Messages -->
    <div
      ref="chatListRef"
      class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:px-24 xl:px-36 2xl:px-48 space-y-4"
      style="min-height: 0"
      @scroll="handleScroll"
    >
      <div
        v-for="(m, idx) in messages"
        :key="m.id"
        :class="[
          'px-4 py-2 break-words',
          m.role === 'user'
            ? 'max-w-[85%] sm:max-w-[80%] md:max-w-xl rounded-lg shadow ml-auto bg-gray-200 text-gray-900 w-fit'
            : 'w-full',
        ]"
      >
        <!-- Pesan user: tampilkan file dan/atau text -->
        <template v-if="m.role === 'user'">
          <!-- Tampilkan file dari DB atau dari local bubble jika baru dikirim -->
          <template v-if="m.files && m.files.length">
            <div class="flex flex-row gap-2 items-center flex-wrap mb-2">
              <template v-for="(file, fidx) in m.files" :key="file.id || fidx">
                <template v-if="file.type && file.type.startsWith('image')">
                  <img
                    :src="file.base64"
                    alt="preview"
                    class="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer"
                    @click="() => handleDbPreview(file)"
                  />
                </template>
                <template v-else>
                  <div
                    class="flex items-center gap-2 cursor-pointer p-2 h-16 border border-gray-300 rounded"
                    @click="() => handleDbPreview(file)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 -960 960 960"
                      fill="red"
                      class="w-7 h-7"
                    >
                      <path
                        d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"
                      />
                    </svg>
                    <span class="text-sm font-medium">{{ file.name }}</span>
                  </div>
                </template>
              </template>
            </div>
            <span v-if="m.content">{{ m.content }}</span>
          </template>
          <!-- Jika tidak ada file, tampilkan hanya text -->
          <template v-else>
            <span>{{ m.content }}</span>
          </template>
        </template>
        <!-- Pesan loading -->
        <span v-else-if="m.id === 'loading'">
          <span class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
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
        <!-- Pesan Gemini -->
        <div
          v-else-if="m.role === 'assistant'"
          class="prose max-w-none overflow-hidden"
          v-html="formatAI(displayedContent[m.id] || '')"
        ></div>
      </div>
    </div>

    <!-- Scroll to bottom button with fade animation -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform translate-y-4 scale-95"
      enter-to-class="opacity-100 transform translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0 scale-100"
      leave-to-class="opacity-0 transform translate-y-4 scale-95"
    >
      <button
        v-if="showScrollToBottomButton"
        @click="resumeAutoScroll"
        class="absolute cursor-pointer bottom-32 left-1/2 transform -translate-x-1/2 bg-gray-400 hover:bg-gray-500 text-white p-2 rounded-full shadow-lg z-10 flex items-center gap-2"
        :class="{ 'animate-pulse': isTyping }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
        <!-- <span v-if="isTyping" class="text-sm"></span> -->
      </button>
    </transition>

    <div class="px-2 sm:px-4 lg:px-24 xl:px-36 2xl:px-48 pb-4 pt-1 shadow-xl">
      <RecordingPanel
        v-model="showRecording"
        :wave-height="10"
        @transcribed="onTranscribed"
        @error="onRecordingError"
      />
      <ChatInputPanel
        v-show="!showRecording"
        v-model="selectedModel"
        :model-options="modelOptions"
        :show-thumbnails="showThumbnails"
        @update:showThumbnails="(v) => (showThumbnails = v)"
        @start-recording="() => (showRecording = true)"
        @preview-image="openImageModal"
        @preview-pdf="openPdfModal"
        @send="handleSend"
      />
    </div>

    <!-- Modal preview image -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded shadow-lg pt-8 px-4 pb-4 relative">
        <img
          :src="modalImageUrl"
          alt="preview"
          class="max-w-[80vw] max-h-[80vh] rounded"
        />
        <button
          @click="showImageModal = false"
          class="absolute top-1 right-2 text-gray-700 cursor-pointer hover:text-gray-900"
        >
          ✕
        </button>
      </div>
    </div>
    <!-- Modal preview pdf -->
    <div
      v-if="showPdfModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded shadow-lg pt-8 px-4 pb-4 relative max-w-[90vw] max-h-[90vh]"
      >
        <embed
          :src="modalPdfUrl"
          type="application/pdf"
          class="w-[70vw] h-[80vh]"
          @error="pdfLoadError = true"
        />
        <div v-if="pdfLoadError" class="text-center mt-4">
          <p class="text-sm text-gray-700">
            Preview PDF tidak didukung di perangkat ini.
          </p>
          <a :href="modalPdfUrl" download class="text-blue-600 underline"
            >Download PDF</a
          >
        </div>
        <button
          @click="showPdfModal = false"
          class="absolute top-1 right-2 text-gray-700 cursor-pointer hover:text-gray-900"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom responsive styles for Gemini messages */
.prose {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

/* Responsive tables */
.prose :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  border-collapse: collapse;
  margin: 1rem 0;
}

@media (max-width: 640px) {
  .prose :deep(table) {
    font-size: 0.875rem;
  }

  .prose :deep(th),
  .prose :deep(td) {
    padding: 0.5rem 0.25rem;
    min-width: 80px;
  }
}

/* Responsive code blocks */
.prose :deep(pre) {
  overflow-x: auto;
  max-width: 100%;
}

.prose :deep(code) {
  word-break: break-all;
  white-space: pre-wrap;
}

/* Responsive images */
.prose :deep(img) {
  max-width: 100%;
  height: auto;
}

/* Long URLs and links */
.prose :deep(a) {
  word-break: break-all;
  overflow-wrap: break-word;
}

/* Lists responsive spacing */
@media (max-width: 640px) {
  .prose :deep(ul),
  .prose :deep(ol) {
    padding-left: 1.25rem;
  }
}
</style>

<script setup lang="ts">
import RecordingPanel from "./RecordingPanel.vue";
import ChatInputPanel from "./ChatInputPanel.vue";
import { ref as vueRef } from "vue";
import { toast } from "vue3-toastify";
const showRecording = vueRef(false);

// State untuk hide thumbnail setelah kirim
const showThumbnails = ref(false);
import { marked } from "marked";
import { useChat } from "@/composables/useChat";
import { nextTick, ref, watch, onMounted, onUnmounted } from "vue";
const { messages, input, send, isLoading, setModel, uploadedFiles } = useChat();

const chatListRef = ref<HTMLElement | null>(null);
const displayedContent = ref<{ [id: string]: string }>({});
const inputRef = ref<HTMLTextAreaElement | null>(null);

// Smart auto-scroll state management
const isUserManuallyScrolling = ref(false);
const isTyping = ref(false);
const showScrollToBottomButton = ref(false);
const shouldAutoScroll = ref(true);
const scrollTimeout = ref<NodeJS.Timeout | null>(null);
const isProgrammaticScroll = ref(false); // Flag to prevent race condition

const modelOptions = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
];
const selectedModel = ref(modelOptions[0].value);
const showFilesMenu = ref(false); // retained for backward compatibility, not used now

// uploadedFiles sekarang diambil dari useChat agar sinkron dengan backend
const showImageModal = ref(false);
const showPdfModal = ref(false);
const modalImageUrl = ref("");
const modalPdfUrl = ref("");
const pdfLoadError = ref(false);

// Pisahkan watcher: perubahan model tidak lagi menghapus thumbnail file yang sedang disiapkan user.
watch(
  messages,
  (newMessages) => {
    showThumbnails.value = false;
    scrollToBottom();

    // Set content untuk semua pesan non-AI response (user messages dan messages lama)
    newMessages.forEach((msg: any) => {
      if (!msg.isAIResponse) {
        displayedContent.value[msg.id] = msg.content;
      }
    });

    // Cari pesan AI baru yang perlu dianimasikan
    const lastMsg = newMessages[newMessages.length - 1];
    if (
      lastMsg &&
      lastMsg.role === "assistant" &&
      lastMsg.isAIResponse &&
      !displayedContent.value[lastMsg.id]
    ) {
      animateMessage(lastMsg.id, lastMsg.content);
    }
  },
  { deep: true }
);
watch(selectedModel, (val) => {
  if (val) setModel(val);
});

onMounted(() => {
  setModel(selectedModel.value);
});

onUnmounted(() => {
  // Cleanup timeout on component unmount
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }
});

// cleanup not required for removed listeners

function handleDbPreview(file: any) {
  if (file.type.startsWith("image")) {
    modalImageUrl.value = file.base64;
    showImageModal.value = true;
  } else if (file.type === "application/pdf") {
    modalPdfUrl.value = file.base64;
    pdfLoadError.value = false;
    showPdfModal.value = true;
  } else {
    // Untuk file selain image/pdf, bisa download
    window.open(file.base64, "_blank");
  }
}
function handleSend() {
  if (!showRecording.value) {
    showThumbnails.value = false;

    // Reset auto-scroll state when user sends a message
    // User wants to see their own message and continue conversation
    shouldAutoScroll.value = true;
    showScrollToBottomButton.value = false;
    isUserManuallyScrolling.value = false;
    isProgrammaticScroll.value = false;

    // Trigger send (user message will be appended by composable)
    send();

    // Force scroll to show user's message immediately
    nextTick(() => scrollToBottom({ instant: false }));
  }
}

function openImageModal(url: string) {
  modalImageUrl.value = url;
  showImageModal.value = true;
}
function openPdfModal(url: string) {
  modalPdfUrl.value = url;
  pdfLoadError.value = false;
  showPdfModal.value = true;
}

function onTranscribed(text: string) {
  input.value = text;
}

function onRecordingError(message: string) {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
  });
}

function scrollToBottom(opts: { instant?: boolean } = {}) {
  // Only auto-scroll if user hasn't manually scrolled up or explicitly allowed
  if (!shouldAutoScroll.value && !opts.instant) {
    return;
  }

  nextTick(() => {
    requestAnimationFrame(() => {
      const el = chatListRef.value;
      if (!el) return;
      const top = el.scrollHeight;
      // Prefer native smooth scroll
      try {
        el.scrollTo({ top, behavior: opts.instant ? "auto" : "smooth" });
      } catch {
        // Fallback
        el.scrollTop = top;
      }
    });
  });
}

// Handle user scroll behavior
function handleScroll() {
  if (!chatListRef.value || isProgrammaticScroll.value) return;

  const el = chatListRef.value;
  const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50; // 50px tolerance

  // Clear any existing timeout
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }

  // If user scrolled up, pause auto-scroll and show button
  if (!isAtBottom) {
    shouldAutoScroll.value = false;
    showScrollToBottomButton.value = true;
    isUserManuallyScrolling.value = true;
  } else {
    // User is at bottom, enable auto-scroll again
    shouldAutoScroll.value = true;
    showScrollToBottomButton.value = false;
    isUserManuallyScrolling.value = false;
  }

  // Set timeout to hide button if user stays at bottom
  scrollTimeout.value = setTimeout(() => {
    if (isAtBottom) {
      showScrollToBottomButton.value = false;
    }
  }, 1000);
}

// Resume auto-scroll when user clicks the button
function resumeAutoScroll() {
  isProgrammaticScroll.value = true; // Prevent handleScroll from interfering
  shouldAutoScroll.value = true;
  showScrollToBottomButton.value = false;
  isUserManuallyScrolling.value = false;

  scrollToBottom({ instant: false });

  // Reset flag after scroll animation completes
  setTimeout(() => {
    isProgrammaticScroll.value = false;
  }, 500); // Wait for smooth scroll to complete
}

// handleEnter now handled inside ChatInputPanel.

function formatAI(text: string) {
  return marked.parse(text);
}

// Animasi typing untuk pesan Gemini
function animateMessage(id: string, content: string) {
  displayedContent.value[id] = "";
  isTyping.value = true; // Set typing state

  let i = 0;
  const interval = setInterval(() => {
    displayedContent.value[id] += content[i];
    i++;

    // Only auto-scroll if user hasn't scrolled up manually
    if (shouldAutoScroll.value) {
      scrollToBottom({ instant: false });
    }

    if (i >= content.length) {
      clearInterval(interval);
      isTyping.value = false; // Clear typing state when done

      // If user was waiting at top, auto-hide the button after typing is done
      if (showScrollToBottomButton.value && !isUserManuallyScrolling.value) {
        setTimeout(() => {
          showScrollToBottomButton.value = false;
        }, 2000);
      }
    }
  }, 30); // 30ms per huruf
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
</script>

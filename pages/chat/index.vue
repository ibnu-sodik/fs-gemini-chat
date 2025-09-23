<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { marked } from "marked";
import ChatSidebar from "@/components/ChatSidebar.vue";
import ChatInputPanel from "@/components/ChatInputPanel.vue";
import RecordingPanel from "@/components/RecordingPanel.vue";
import { useChat } from "@/composables/useChat";

const router = useRouter();
const isSidebarOpen = ref(false);
const showRecording = ref(false);
const showThumbnails = ref(false);
const displayedContent = ref<{ [id: string]: string }>({});
const chatListRef = ref<HTMLElement | null>(null);
const isAnimating = ref(false); // Flag to prevent interruptions during animation

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

// Initialize chat composable
const {
  messages,
  input,
  isLoading,
  activeSessionId,
  uploadedFiles,
  newChat,
  send: originalSend,
  setModel,
  isUpdatingSession,
  sessions,
  fetchSessions,
  clearState,
  updateSessionTitle: updateSessionTitleComposable,
  autoRenameSession,
  generateTitleWithLLM,
  autoRenameSessionWithTitle,
} = useChat();

// Clear messages and session when on /chat page (not /chat/[sessionId])
// This ensures fresh start for new conversations
clearState();
displayedContent.value = {}; // Also clear local displayed content

const modelOptions = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
];
const selectedModel = ref(modelOptions[0].value);

// Enhanced send function with new flow
async function handleSend() {
  if (!showRecording.value && input.value.trim()) {
    showThumbnails.value = false;

    // Step 1: Tampilkan pesan user dan disable tombol kirim
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: input.value.trim(),
      files:
        uploadedFiles.value.length > 0 ? [...uploadedFiles.value] : undefined,
    };

    messages.value.push(userMessage);
    displayedContent.value[userMessage.id] = userMessage.content;
    isLoading.value = true; // Disable send button

    const currentInput = input.value.trim();
    input.value = ""; // Clear input immediately
    uploadedFiles.value = []; // Clear files

    try {
      // Step 2: Buat session baru jika belum ada
      if (!activeSessionId.value) {
        const sessionId = await createNewSession();
        activeSessionId.value = sessionId;

        // Step 3: Navigate ke URL session baru

        await router.push(`/chat/${sessionId}`);
      }

      // Step 4: Kirim pesan ke backend

      await sendMessageToBackend(currentInput, userMessage);
    } catch (error) {
      console.error("Error in handleSend:", error);
      toast.error("Failed to send message", {
        position: "top-center",
        autoClose: 3000,
      });

      // Remove user message if error occurred
      const msgIndex = messages.value.findIndex((m) => m.id === userMessage.id);
      if (msgIndex !== -1) {
        messages.value.splice(msgIndex, 1);
        delete displayedContent.value[userMessage.id];
      }
    } finally {
      isLoading.value = false; // Re-enable send button
    }
  }
}

// Helper function to create new session
async function createNewSession() {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "New Chat", // Temporary title
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create session");
  }

  const data = await res.json();

  // Add session to local sessions array immediately at the top
  const { sessions } = useChat();
  sessions.value.unshift({
    id: data.session.id,
    title: "New Chat",
  });

  return data.session.id;
}

// Helper function to send message to backend
async function sendMessageToBackend(messageContent: string, userMessage: any) {
  // Add loading bubble
  const loadingMsg = {
    id: "loading",
    role: "assistant" as const,
    content: "●●●",
    isAIResponse: true,
  };
  messages.value.push(loadingMsg);
  displayedContent.value[loadingMsg.id] = "●●●";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: messageContent,
        sessionId: activeSessionId.value,
        model: selectedModel.value,
        files: userMessage.files || [],
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Remove loading bubble
    const loadingIndex = messages.value.findIndex((m) => m.id === "loading");
    if (loadingIndex !== -1) {
      messages.value.splice(loadingIndex, 1);
      delete displayedContent.value["loading"];
    }

    // Step 6: Tampilkan respons Gemini dengan animasi

    // Try different possible response fields - API should return { response, role, isAIResponse }
    const responseContent =
      data.response ||
      data.message ||
      data.content ||
      data.text ||
      "[No response from AI]";

    const assistantMsg = {
      id: `a-${Date.now()}`,
      role: "assistant" as const,
      content: responseContent,
      isAIResponse: data.isAIResponse || true, // Use from API or default to true
    };

    messages.value.push(assistantMsg);

    // Step 5: Update session title (hanya untuk pesan pertama) dengan LLM
    const messageCount = messages.value.filter((m) => m.role === "user").length;
    if (messageCount === 1) {
      // Use LLM title generation
      try {
        const generatedTitle = await generateTitleWithLLM(
          messageContent,
          selectedModel.value
        );
        await autoRenameSessionWithTitle(activeSessionId.value, generatedTitle);
      } catch (error) {
        console.error("LLM title generation failed, using fallback:", error);
        // Fallback ke auto rename sederhana
        await autoRenameSession(activeSessionId.value, messageContent);
      }
    }

    // Start animation
    animateMessage(assistantMsg.id, assistantMsg.content);
  } catch (error) {
    // Remove loading bubble if error
    const loadingIndex = messages.value.findIndex((m) => m.id === "loading");
    if (loadingIndex !== -1) {
      messages.value.splice(loadingIndex, 1);
      delete displayedContent.value["loading"];
    }
    throw error;
  }
}

function scrollToBottom(opts: { instant?: boolean } = {}) {
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

// Animasi typing untuk pesan Gemini
function animateMessage(id: string, content: string) {
  isAnimating.value = true;

  displayedContent.value[id] = "";
  let i = 0;
  const interval = setInterval(() => {
    displayedContent.value[id] += content[i];
    i++;
    scrollToBottom({ instant: false });
    if (i >= content.length) {
      clearInterval(interval);

      isAnimating.value = false;
    }
  }, 15); // 15ms per huruf
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

function openImageModal(url: string) {
  // Handle image preview if needed
  console.log("Image preview:", url);
}

function openPdfModal(url: string) {
  // Handle PDF preview if needed
  console.log("PDF preview:", url);
}

function formatMessage(text: string) {
  return marked.parse(text);
}

// Set default model
setModel(selectedModel.value);
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <ChatSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col h-full min-h-0">
      <!-- Navbar/Header (mobile & desktop) -->
      <header
        class="flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm"
      >
        <div class="flex items-center gap-2">
          <button
            @click="toggleSidebar"
            class="md:hidden text-gray-600 hover:text-gray-900"
          >
            ☰
          </button>
          <span class="font-semibold text-gray-900">Nuxt Gemini Chatbot</span>
        </div>
        <!-- Desktop navigation -->
        <div class="hidden md:flex items-center gap-4">
          <NuxtLink
            to="/"
            class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md transition-colors"
          >
            ← Back to Home
          </NuxtLink>
        </div>
      </header>

      <!-- Main content area -->
      <div class="flex-1 min-h-0 flex flex-col">
        <!-- Chat Messages Area -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4" style="min-height: 0">
          <div
            v-if="messages.length === 0"
            class="h-full flex items-center justify-center"
          >
            <div class="text-center max-w-md mx-auto p-8">
              <div
                class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                Start a New Conversation
              </h2>
              <p class="text-gray-600 mb-6">
                Type a message below to start chatting with Gemini AI. A new
                chat session will be created automatically.
              </p>
            </div>
          </div>

          <!-- Messages -->
          <div
            v-for="(m, idx) in messages"
            :key="m.id"
            :class="[
              'px-4 py-2 w-fit ',
              m.role === 'user'
                ? 'max-w-[80vw] md:max-w-xl rounded-lg shadow ml-auto bg-gray-200 text-gray-900'
                : 'mr-auto',
            ]"
          >
            <!-- User message: show files and/or text -->
            <template v-if="m.role === 'user'">
              <!-- Show files from DB or local bubble if just sent -->
              <template v-if="m.files && m.files.length">
                <div class="flex flex-row gap-2 items-center flex-wrap mb-2">
                  <template
                    v-for="(file, fidx) in m.files"
                    :key="file.id || fidx"
                  >
                    <template v-if="file.type && file.type.startsWith('image')">
                      <img
                        :src="file.base64"
                        alt="preview"
                        class="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer"
                        @click="() => openImageModal(file.base64)"
                      />
                    </template>
                    <template v-else>
                      <div
                        class="flex items-center gap-2 cursor-pointer p-2 h-16 border border-gray-300 rounded"
                        @click="() => openPdfModal(file.base64)"
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
              <!-- If no files, show only text -->
              <template v-else>
                <span>{{ m.content }}</span>
              </template>
            </template>
            <!-- Loading message -->
            <span v-else-if="m.id === 'loading'">
              <span class="flex items-center gap-2">
                <svg
                  class="animate-spin h-4 w-4 text-gray-500"
                  viewBox="0 0 24 24"
                >
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
            <!-- Assistant message -->
            <span
              v-else-if="m.role === 'assistant'"
              v-html="formatMessage(displayedContent[m.id] || '')"
            ></span>
          </div>
        </div>

        <!-- Input Panel -->
        <div class="px-4 pb-4 pt-1 shadow-xl">
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
      </div>
    </div>
  </div>
</template>

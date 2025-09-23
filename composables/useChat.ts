import { ref, onMounted } from "vue";
import { useRuntimeConfig } from "#imports";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: any[];
  isAIResponse?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
}

// Global reactive state
const globalState = {
  sessions: ref<ChatSession[]>([]),
  activeSessionId: ref<string>(""),
  activeModel: ref<string>(""),
  messages: ref<Message[]>([]),
  input: ref(""),
  isLoading: ref(false),
  uploadedFiles: ref<any[]>([]),
  isUpdatingSession: ref(false), // Flag to prevent reactivity conflicts
  isTypingTitle: ref<string | null>(null), // Track which session is being auto-renamed
  initialized: false,
};

export function useChat() {
  // Use global reactive state
  const sessions = globalState.sessions;
  const activeSessionId = globalState.activeSessionId;
  const activeModel = globalState.activeModel;
  const messages = globalState.messages;
  const input = globalState.input;
  const isLoading = globalState.isLoading;
  const uploadedFiles = globalState.uploadedFiles;
  const isUpdatingSession = globalState.isUpdatingSession;
  const isTypingTitle = globalState.isTypingTitle;

  async function fetchSessions(shouldFetchMessages: boolean = true) {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    sessions.value = data.sessions;
    if (sessions.value.length > 0 && shouldFetchMessages) {
      // Jika session aktif tidak ada, pilih pertama
      if (
        !activeSessionId.value ||
        !sessions.value.find((s) => s.id === activeSessionId.value)
      ) {
        activeSessionId.value = sessions.value[0].id;
      }
      await fetchMessages(activeSessionId.value);
    } else if (sessions.value.length === 0) {
      messages.value = [];
    }
  }

  async function fetchMessages(sessionId: string) {
    try {
      // Validate sessionId before making request
      if (
        !sessionId ||
        typeof sessionId !== "string" ||
        sessionId.trim().length === 0
      ) {
        console.warn("Invalid sessionId provided:", sessionId);
        messages.value = [];
        return;
      }

      const encodedSessionId = encodeURIComponent(sessionId.trim());

      // Use $fetch for proper Nuxt API calls
      const response = await $fetch("/api/messages", {
        query: {
          sessionId: encodedSessionId,
        },
      });

      // $fetch automatically handles JSON parsing and throws on HTTP errors
      messages.value = (response.messages || []) as Message[];
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Set empty messages on error
      messages.value = [];
    }
  }

  function setActive(id: string) {
    activeSessionId.value = id;
    fetchMessages(id);
  }

  async function setActiveSession(id: string) {
    // Validate sessionId
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      console.warn("Invalid sessionId provided to setActiveSession:", id);
      return;
    }

    const cleanId = id.trim();

    // Prevent duplicate calls for the same session
    if (activeSessionId.value === cleanId) {
      return;
    }

    activeSessionId.value = cleanId;

    // Clear current messages first
    messages.value = [];

    await fetchMessages(cleanId);
  }
  function setModel(model: string = "gemini-1.5-pro") {
    activeModel.value = model;
  }

  function clearState() {
    activeSessionId.value = "";
    messages.value = [];
    input.value = "";
    uploadedFiles.value = [];
    isLoading.value = false;
    isUpdatingSession.value = false;
  }

  async function newChat() {
    // Buat session baru
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }),
    });
    const data = await res.json();
    // Set session aktif ke session baru
    if (data.session && data.session.id) {
      activeSessionId.value = data.session.id;
      messages.value = [];

      // Add new session to the top of the sessions list immediately
      sessions.value.unshift({
        id: data.session.id,
        title: "New Chat",
      });

      return data.session.id; // Return session ID for navigation
    } else {
      await fetchSessions();
      if (sessions.value.length > 0) {
        activeSessionId.value = sessions.value[0].id; // Use first (newest) session
        messages.value = [];
        return activeSessionId.value; // Return session ID for navigation
      }
    }
  }

  async function updateSessionTitle(sessionId: string, title: string) {
    try {
      isUpdatingSession.value = true; // Set flag to prevent reactivity conflicts

      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        // Update the session title in the sidebar
        const sessionIndex = sessions.value.findIndex(
          (s) => s.id === sessionId
        );
        if (sessionIndex !== -1) {
          // Use nextTick to avoid immediate reactivity conflicts
          await new Promise((resolve) => setTimeout(resolve, 100));
          sessions.value[sessionIndex].title = title;
        }
      }
    } catch (error) {
      console.error("Failed to update session title:", error);
    } finally {
      isUpdatingSession.value = false; // Reset flag
    }
  }

  function generateTitleFromMessage(message: string): string {
    // Take first 30 characters and clean up
    const title = message.trim().slice(0, 30);
    return title.length < message.trim().length ? title + "..." : title;
  }

  async function send() {
    if (!input.value.trim() && uploadedFiles.value.length === 0) return;

    let currentSessionId = activeSessionId.value;
    let shouldUpdateTitle = false;

    // If no active session, create one
    if (!currentSessionId) {
      try {
        currentSessionId = await newChat();
        if (!currentSessionId) {
          console.error("Failed to create new session");
          return;
        }
        shouldUpdateTitle = true; // New session should get proper title
      } catch (error) {
        console.error("Error creating new session:", error);
        return;
      }
    } else {
      // Check if this is the first user message in existing session
      const userMessageCount = messages.value.filter(
        (m) => m.role === "user"
      ).length;
      if (userMessageCount === 0) {
        shouldUpdateTitle = true; // First message in existing session
      }
    }

    if (!activeModel.value) return;

    // Store the message content for title generation and API call
    const messageContent = input.value.trim();
    const promptToSend = input.value;

    // Clear input immediately for better UX
    input.value = "";

    isLoading.value = true;

    // Proses file yang diunggah
    const filesData = await Promise.all(
      uploadedFiles.value.map(async (file) => {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file.file);
        });
        return {
          id: file.id,
          name: file.name,
          type: file.file.type,
          base64,
        };
      })
    );

    // Tampilkan pesan user langsung di chatwindow, beserta file
    const userMsg: Message = {
      id: "u-" + Date.now(),
      role: "user",
      content: promptToSend,
      files: filesData,
    };
    messages.value.push(userMsg);

    // Tampilkan bubble loading balasan
    const loadingMsg: Message = {
      id: "loading",
      role: "assistant",
      content: "",
    };
    messages.value.push(loadingMsg);

    // Clear uploaded files immediately
    uploadedFiles.value = [];

    // Kirim ke backend
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          role: "user",
          sessionId: currentSessionId,
          model: activeModel.value,
          files: filesData, // Sertakan file yang diunggah
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      // Hapus bubble loading
      const idx = messages.value.findIndex((m) => m.id === "loading");
      if (idx !== -1) messages.value.splice(idx, 1);

      // Tampilkan response Gemini langsung tanpa fetch ulang
      const assistantMsg: Message = {
        id: "a-" + Date.now(),
        role: "assistant",
        content: data.response || "[No response from AI]",
        isAIResponse: true,
      };

      messages.value.push(assistantMsg);

      // Update session title if this was the first message
      if (shouldUpdateTitle && messageContent) {
        // Use autoRenameSession for consistency
        await autoRenameSession(currentSessionId, messageContent);
      }
    } catch (error) {
      console.error("Send message error:", error);

      // Hapus bubble loading jika error
      const idx = messages.value.findIndex((m) => m.id === "loading");
      if (idx !== -1) messages.value.splice(idx, 1);

      // Tampilkan pesan error
      const errorMsg: Message = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: `❌ Terjadi kesalahan: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
      messages.value.push(errorMsg);
    }

    isLoading.value = false;
  }

  async function updateSession(sessionId: string, updates: { title?: string }) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      // Update local sessions
      const sessionIndex = sessions.value.findIndex((s) => s.id === sessionId);
      if (sessionIndex !== -1 && updates.title) {
        sessions.value[sessionIndex].title = updates.title;
      }
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  }

  async function deleteSession(sessionId: string) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      // Remove from local sessions
      sessions.value = sessions.value.filter((s) => s.id !== sessionId);

      // Clear messages and active session if this was the active session
      if (activeSessionId.value === sessionId) {
        activeSessionId.value = "";
        messages.value = [];
        input.value = "";
        uploadedFiles.value = [];
        isLoading.value = false;
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }

  // Helper function for auto-renaming new chats with typing animation
  async function autoRenameSession(sessionId: string, firstMessage: string) {
    if (!sessionId || !firstMessage.trim()) return;

    const newTitle = generateTitleFromMessage(firstMessage);

    // Add delay to ensure AI response animation is complete
    setTimeout(async () => {
      // Start typing animation
      isTypingTitle.value = sessionId;

      // Find session and set temporary typing state
      const sessionIndex = sessions.value.findIndex((s) => s.id === sessionId);
      const originalTitle =
        sessionIndex !== -1 ? sessions.value[sessionIndex].title : "New Chat";

      if (sessionIndex !== -1) {
        // Animate typing effect
        await animateTypingTitle(sessionIndex, newTitle);
      }

      // Update title in database
      await updateSessionTitle(sessionId, newTitle);

      // Stop typing animation
      isTypingTitle.value = null;
    }, 3000); // 3 second delay
  }

  // Animate typing effect for title
  async function animateTypingTitle(sessionIndex: number, newTitle: string) {
    return new Promise<void>((resolve) => {
      // Clear current title and start typing
      sessions.value[sessionIndex].title = "";

      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < newTitle.length) {
          sessions.value[sessionIndex].title += newTitle[i];
          i++;
        } else {
          clearInterval(typingInterval);
          resolve();
        }
      }, 50); // 50ms per character
    });
  }

  // Initialize only once
  if (!globalState.initialized) {
    // Don't auto-fetch messages on initialization, let route handle it
    onMounted(() => {
      fetchSessions(false); // Don't fetch messages automatically
    });
    globalState.initialized = true;
  }

  return {
    sessions,
    activeSessionId,
    setActive,
    setActiveSession,
    setModel,
    newChat,
    updateSessionTitle,
    updateSession,
    deleteSession,
    generateTitleFromMessage,
    autoRenameSession,
    messages,
    input,
    send,
    isLoading,
    uploadedFiles,
    isUpdatingSession,
    isTypingTitle,
    fetchSessions,
    clearState,
  };
}

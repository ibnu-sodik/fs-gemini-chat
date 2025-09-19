import { ref, onMounted } from "vue";
import { useRuntimeConfig } from "#imports";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
}

let chatState: any;

export function useChat() {
  if (chatState) return chatState;

  const sessions = ref<ChatSession[]>([]);
  const activeSessionId = ref<string>("");
  const messages = ref<Message[]>([]);
  const input = ref("");
  const isLoading = ref(false);

  async function fetchSessions() {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    sessions.value = data.sessions;
    if (sessions.value.length > 0) {
      // Jika session aktif tidak ada, pilih pertama
      if (
        !activeSessionId.value ||
        !sessions.value.find((s) => s.id === activeSessionId.value)
      ) {
        activeSessionId.value = sessions.value[0].id;
      }
      await fetchMessages(activeSessionId.value);
    } else {
      messages.value = [];
    }
  }

  async function fetchMessages(sessionId: string) {
    const res = await fetch(`/api/messages?sessionId=${sessionId}`);
    const data = await res.json();
    messages.value = data.messages;
  }

  function setActive(id: string) {
    activeSessionId.value = id;
    fetchMessages(id);
  }

  async function newChat() {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }),
    });
    await fetchSessions();
  }

  async function send() {
    if (!input.value.trim() || !activeSessionId.value) return;
    isLoading.value = true;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: input.value,
        role: "user",
        sessionId: activeSessionId.value,
      }),
    });
    const data = await res.json();
    // Refresh messages dari backend agar sinkron
    await fetchMessages(activeSessionId.value);
    input.value = "";
    isLoading.value = false;
  }

  onMounted(fetchSessions);

  chatState = {
    sessions,
    activeSessionId,
    setActive,
    newChat,
    messages,
    input,
    send,
    isLoading,
  };
  return chatState;
}

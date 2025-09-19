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

export function useChat(sessionId: string) {
  const sessions = ref<ChatSession[]>([]);
  const activeSessionId = ref<string>("");
  const messages = ref<Message[]>([]);
  const input = ref("");
  const isLoading = ref(false);

  async function fetchSessions() {
    // Ambil session dari API backend
    const res = await fetch("/api/sessions");
    const data = await res.json();
    sessions.value = data.sessions;
    if (sessions.value.length > 0) {
      activeSessionId.value = sessions.value[0].id;
      await fetchMessages(activeSessionId.value);
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
    // Buat session baru via API
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }),
    });
    await fetchSessions();
  }

  async function send() {
    if (!input.value.trim() || !activeSessionId.value) return;
    isLoading.value = true;
    // Kirim pesan user ke backend
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
    // Tambahkan pesan user dan AI ke state
    messages.value.push({
      id: "u-" + Date.now(),
      role: "user",
      content: input.value,
    });
    messages.value.push({
      id: "a-" + Date.now(),
      role: "assistant",
      content: data.response,
    });
    input.value = "";
    isLoading.value = false;
  }

  onMounted(fetchSessions);

  return {
    sessions,
    activeSessionId,
    setActive,
    newChat,
    messages,
    input,
    send,
    isLoading,
  };
}

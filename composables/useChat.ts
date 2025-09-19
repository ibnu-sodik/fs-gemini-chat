import { ref } from "vue";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useChat(sessionId: string) {
  const messages = ref<Message[]>([]);
  const input = ref("");
  const isLoading = ref(false);

  async function send() {
    if (!input.value.trim()) return;
    // Tambahkan pesan user ke state
    const userMsg: Message = {
      id: "u-" + Date.now(),
      role: "user",
      content: input.value,
    };
    messages.value.push(userMsg);

    isLoading.value = true;

    // Kirim ke backend
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input.value, role: "user" }),
    });
    const data = await res.json();

    // Tambahkan response AI ke state
    const aiMsg: Message = {
      id: "a-" + Date.now(),
      role: data.role || "assistant",
      content: data.response,
    };
    messages.value.push(aiMsg);

    input.value = "";
    isLoading.value = false;
  }

  return {
    messages,
    input,
    send,
    isLoading,
  };
}

import { ref } from "vue";

interface Message {
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
    // Tambahkan pesan user lokal
    messages.value.push({
      id: "u-" + Date.now(),
      role: "user",
      content: input.value,
    });

    isLoading.value = true;

    // Mulai streaming dari server endpoint
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages.value] }),
    });

    if (!res.body) {
      isLoading.value = false;
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantId = "a-" + Date.now();
    messages.value.push({ id: assistantId, role: "assistant", content: "" });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // bisa jadi chunk mengandung JSON atau raw teks tergantung bagaimana server streaming mengirim
      // misal chunk adalah teks langsung:
      messages.value = messages.value.map((m) => {
        if (m.id === assistantId) {
          return { ...m, content: m.content + chunk };
        }
        return m;
      });
    }

    isLoading.value = false;
    input.value = "";
  }

  return {
    messages,
    input,
    send,
    isLoading,
  };
}

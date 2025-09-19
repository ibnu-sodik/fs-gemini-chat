// composables/useChat.ts
import { ref, computed } from "vue";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

const sessions = ref<ChatSession[]>([]);
const activeSessionId = ref<string | null>(null);

export function useChat() {
  function newChat() {
    const id = Date.now().toString();
    sessions.value.push({
      id,
      title: `Chat ${sessions.value.length + 1}`,
      messages: [],
    });
    activeSessionId.value = id;
  }

  function sendMessage(content: string) {
    if (!activeSessionId.value) return;
    const session = sessions.value.find((s) => s.id === activeSessionId.value);
    if (!session) return;

    // Pesan user
    session.messages.push({
      id: Date.now().toString(),
      role: "user",
      content,
    });

    // Balasan AI (dummy)
    setTimeout(() => {
      session.messages.push({
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: `AI menjawab: "${content}" (dummy response)`,
      });
    }, 500);
  }

  function setActive(id: string) {
    activeSessionId.value = id;
  }

  const activeSession = computed(
    () => sessions.value.find((s) => s.id === activeSessionId.value) || null
  );

  return {
    sessions,
    activeSessionId,
    activeSession,
    newChat,
    sendMessage,
    setActive,
  };
}

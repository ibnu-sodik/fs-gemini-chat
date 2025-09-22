import { ref, onMounted } from "vue";
import { useRuntimeConfig } from "#imports";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: any[];
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
  const activeModel = ref<string>("");
  const messages = ref<Message[]>([]);
  const input = ref("");
  const isLoading = ref(false);
  const uploadedFiles = ref<any[]>([]); // Tambahkan ref untuk file yang diunggah

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

  function setModel(model: string = "gemini-1.5-pro") {
    activeModel.value = model;
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
      await fetchSessions();
    } else {
      await fetchSessions();
      if (sessions.value.length > 0) {
        activeSessionId.value = sessions.value[sessions.value.length - 1].id;
        messages.value = [];
      }
    }
  }

  async function send() {
    if (!input.value.trim() && uploadedFiles.value.length === 0) return;
    if (!activeSessionId.value || !activeModel.value) return;

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
      content: input.value,
      files: filesData,
    };
    messages.value.push(userMsg);

    // Jangan hapus thumbnail/file di sini, biarkan tetap ada sampai balasan Gemini diterima

    // Tampilkan bubble loading balasan
    const loadingMsg: Message = {
      id: "loading",
      role: "assistant",
      content: "",
    };
    messages.value.push(loadingMsg);

    const promptToSend = input.value;
    input.value = "";

    // Kirim ke backend
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptToSend,
        role: "user",
        sessionId: activeSessionId.value,
        model: activeModel.value,
        files: filesData, // Sertakan file yang diunggah
      }),
    });

    const data = await res.json();

    // Hapus bubble loading
    const idx = messages.value.findIndex((m) => m.id === "loading");
    if (idx !== -1) messages.value.splice(idx, 1);

    // Refresh messages dan sessions agar judul session update
    await fetchMessages(activeSessionId.value);
    await fetchSessions();

    // Setelah balasan Gemini diterima, baru hapus thumbnail/file
    uploadedFiles.value = [];

    isLoading.value = false;
  }

  onMounted(fetchSessions);

  chatState = {
    sessions,
    activeSessionId,
    setActive,
    setModel,
    newChat,
    messages,
    input,
    send,
    isLoading,
    uploadedFiles, // Ekspor uploadedFiles
  };
  return chatState;
}

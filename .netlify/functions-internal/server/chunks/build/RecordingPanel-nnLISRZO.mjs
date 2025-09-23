import { defineComponent, ref, mergeProps, unref, computed, watch, reactive, nextTick, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderList, ssrInterpolate, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { c as useAuth, d as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { toast } from 'vue3-toastify';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "SidebarHeader",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-3 border-b border-gray-200" }, _attrs))}><div class="flex items-center justify-between md:justify-center"><div class="w-8 md:hidden"></div><div class="w-10 h-10 bg-gradient-to-bl from-gray-100 to-gray-500 rounded-lg flex items-center justify-center shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"></path></svg></div><button class="md:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors" aria-label="Close sidebar"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/sidebar/SidebarHeader.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = () => {
  console.error(intervalError);
};
const globalState = {
  sessions: ref([]),
  activeSessionId: ref(""),
  activeModel: ref(""),
  messages: ref([]),
  input: ref(""),
  isLoading: ref(false),
  uploadedFiles: ref([]),
  isUpdatingSession: ref(false),
  // Flag to prevent reactivity conflicts
  isTypingTitle: ref(null),
  // Track which session is being auto-renamed
  isLoadingSession: ref(false),
  // Flag to distinguish loading existing session vs new messages
  initialized: false
};
function useChat() {
  const sessions = globalState.sessions;
  const activeSessionId = globalState.activeSessionId;
  const activeModel = globalState.activeModel;
  const messages = globalState.messages;
  const input = globalState.input;
  const isLoading = globalState.isLoading;
  const uploadedFiles = globalState.uploadedFiles;
  const isUpdatingSession = globalState.isUpdatingSession;
  const isTypingTitle = globalState.isTypingTitle;
  const isLoadingSession = globalState.isLoadingSession;
  async function fetchSessions(shouldFetchMessages = true) {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    sessions.value = data.sessions;
    if (sessions.value.length > 0 && shouldFetchMessages) {
      if (!activeSessionId.value || !sessions.value.find((s) => s.id === activeSessionId.value)) {
        activeSessionId.value = sessions.value[0].id;
      }
      await fetchMessages(activeSessionId.value);
    } else if (sessions.value.length === 0) {
      messages.value = [];
    }
  }
  async function fetchMessages(sessionId) {
    try {
      if (!sessionId || typeof sessionId !== "string" || sessionId.trim().length === 0) {
        console.warn("Invalid sessionId provided:", sessionId);
        messages.value = [];
        return;
      }
      const encodedSessionId = encodeURIComponent(sessionId.trim());
      const response = await $fetch("/api/messages", {
        query: {
          sessionId: encodedSessionId
        }
      });
      messages.value = response.messages || [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      messages.value = [];
    }
  }
  function setActive(id) {
    activeSessionId.value = id;
    fetchMessages(id);
  }
  async function setActiveSession(id) {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      console.warn("Invalid sessionId provided to setActiveSession:", id);
      return;
    }
    const cleanId = id.trim();
    if (activeSessionId.value === cleanId) {
      return;
    }
    isLoadingSession.value = true;
    activeSessionId.value = cleanId;
    messages.value = [];
    await fetchMessages(cleanId);
    isLoadingSession.value = false;
  }
  function setModel(model = "gemini-1.5-pro") {
    activeModel.value = model;
  }
  function clearState() {
    activeSessionId.value = "";
    messages.value = [];
    input.value = "";
    uploadedFiles.value = [];
    isLoading.value = false;
    isUpdatingSession.value = false;
    isLoadingSession.value = false;
  }
  async function newChat() {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" })
    });
    const data = await res.json();
    if (data.session && data.session.id) {
      activeSessionId.value = data.session.id;
      messages.value = [];
      sessions.value.unshift({
        id: data.session.id,
        title: "New Chat"
      });
      return data.session.id;
    } else {
      await fetchSessions();
      if (sessions.value.length > 0) {
        activeSessionId.value = sessions.value[0].id;
        messages.value = [];
        return activeSessionId.value;
      }
    }
  }
  async function updateSessionTitle(sessionId, title) {
    try {
      isUpdatingSession.value = true;
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        const sessionIndex = sessions.value.findIndex(
          (s) => s.id === sessionId
        );
        if (sessionIndex !== -1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          sessions.value[sessionIndex].title = title;
        }
      }
    } catch (error) {
      console.error("Failed to update session title:", error);
    } finally {
      isUpdatingSession.value = false;
    }
  }
  function generateTitleFromMessage(message) {
    const title = message.trim().slice(0, 30);
    return title.length < message.trim().length ? title + "..." : title;
  }
  async function generateTitleWithLLM(message, modelOverride) {
    const modelToUse = modelOverride || activeModel.value;
    try {
      const response = await $fetch("/api/generate-title", {
        method: "POST",
        body: {
          message: message.trim(),
          model: modelToUse
          // Kirim model yang dipilih user
        }
      });
      const finalTitle = response.title || generateTitleFromMessage(message);
      return finalTitle;
    } catch (error) {
      console.error("LLM title generation failed:", error);
      const fallbackTitle = generateTitleFromMessage(message);
      return fallbackTitle;
    }
  }
  async function send() {
    if (!input.value.trim() && uploadedFiles.value.length === 0) return;
    let currentSessionId = activeSessionId.value;
    let shouldUpdateTitle = false;
    if (!currentSessionId) {
      try {
        currentSessionId = await newChat();
        if (!currentSessionId) {
          console.error("Failed to create new session");
          return;
        }
        shouldUpdateTitle = true;
      } catch (error) {
        console.error("Error creating new session:", error);
        return;
      }
    } else {
      const userMessageCount = messages.value.filter(
        (m) => m.role === "user"
      ).length;
      if (userMessageCount === 0) {
        shouldUpdateTitle = true;
      }
    }
    if (!activeModel.value) return;
    const messageContent = input.value.trim();
    const promptToSend = input.value;
    input.value = "";
    isLoading.value = true;
    const filesData = await Promise.all(
      uploadedFiles.value.map(async (file) => {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file.file);
        });
        return {
          id: file.id,
          name: file.name,
          type: file.file.type,
          base64
        };
      })
    );
    const userMsg = {
      id: "u-" + Date.now(),
      role: "user",
      content: promptToSend,
      files: filesData
    };
    messages.value.push(userMsg);
    const loadingMsg = {
      id: "loading",
      role: "assistant",
      content: ""
    };
    messages.value.push(loadingMsg);
    uploadedFiles.value = [];
    try {
      const chatApiCall = $fetch("/api/chat", {
        method: "POST",
        body: {
          prompt: promptToSend,
          role: "user",
          sessionId: currentSessionId,
          model: activeModel.value,
          files: filesData
        }
      });
      let titlePromise = null;
      if (shouldUpdateTitle && messageContent) {
        titlePromise = generateTitleWithLLM(messageContent);
      }
      const data = await chatApiCall;
      const idx = messages.value.findIndex((m) => m.id === "loading");
      if (idx !== -1) messages.value.splice(idx, 1);
      const assistantMsg = {
        id: "a-" + Date.now(),
        role: "assistant",
        content: data.response || "[No response from AI]",
        isAIResponse: true
      };
      messages.value.push(assistantMsg);
      if (titlePromise) {
        titlePromise.then((generatedTitle) => {
          autoRenameSessionWithTitle(currentSessionId, generatedTitle);
        }).catch((error) => {
          console.error("Title generation failed:", error);
          autoRenameSession(currentSessionId, messageContent);
        });
      }
    } catch (error) {
      console.error("Send message error:", error);
      const idx = messages.value.findIndex((m) => m.id === "loading");
      if (idx !== -1) messages.value.splice(idx, 1);
      const errorMsg = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: `\u274C Terjadi kesalahan: ${error instanceof Error ? error.message : "Unknown error"}`
      };
      messages.value.push(errorMsg);
    }
    isLoading.value = false;
  }
  async function updateSession(sessionId, updates) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const sessionIndex = sessions.value.findIndex((s) => s.id === sessionId);
      if (sessionIndex !== -1 && updates.title) {
        sessions.value[sessionIndex].title = updates.title;
      }
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  }
  async function deleteSession(sessionId) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      sessions.value = sessions.value.filter((s) => s.id !== sessionId);
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
  async function autoRenameSessionWithTitle(sessionId, newTitle) {
    if (!sessionId || !newTitle.trim()) return;
    setTimeout(async () => {
      isTypingTitle.value = sessionId;
      const sessionIndex = sessions.value.findIndex((s) => s.id === sessionId);
      if (sessionIndex !== -1) {
        await animateTypingTitle(sessionIndex);
      }
      await updateSessionTitle(sessionId, newTitle);
      isTypingTitle.value = null;
    }, 3e3);
  }
  async function autoRenameSession(sessionId, firstMessage) {
    if (!sessionId || !firstMessage.trim()) return;
    const newTitle = generateTitleFromMessage(firstMessage);
    await autoRenameSessionWithTitle(sessionId, newTitle);
  }
  async function animateTypingTitle(sessionIndex, newTitle) {
    return new Promise((resolve) => {
      sessions.value[sessionIndex].title = "";
      setInterval();
    });
  }
  if (!globalState.initialized) {
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
    generateTitleWithLLM,
    autoRenameSession,
    autoRenameSessionWithTitle,
    messages,
    input,
    send,
    isLoading,
    uploadedFiles,
    isUpdatingSession,
    isTypingTitle,
    isLoadingSession,
    fetchSessions,
    clearState
  };
}
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "SidebarActions",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    useChat();
    const isCreatingNewChat = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 space-y-3" }, _attrs))}><button class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path></svg><span>Search chats</span></button><button${ssrIncludeBooleanAttr(unref(isCreatingNewChat)) ? " disabled" : ""} class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">`);
      if (unref(isCreatingNewChat)) {
        _push(`<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
      } else {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>`);
      }
      _push(`<span>${ssrInterpolate(unref(isCreatingNewChat) ? "Creating..." : "New chat")}</span></button></div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/sidebar/SidebarActions.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "SessionItem",
  __ssrInlineRender: true,
  props: {
    session: {},
    isActive: { type: Boolean },
    isTyping: { type: Boolean }
  },
  emits: ["select", "delete", "rename"],
  setup(__props, { emit: __emit }) {
    useChat();
    const showOptions = ref(false);
    const isEditing = ref(false);
    const editingTitle = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [
          "relative group pl-3 pr-2 py-1.5 mx-1 rounded cursor-pointer transition-colors flex items-center justify-between text-sm",
          _ctx.isActive ? "bg-gray-300/70 text-gray-800" : unref(isEditing) ? "bg-gray-200 text-gray-700" : "hover:bg-gray-200 text-gray-700"
        ]
      }, _attrs))}>`);
      if (!unref(isEditing)) {
        _push(`<div class="flex-1 truncate flex items-center gap-2"><span class="text-sm">${ssrInterpolate(_ctx.session.title)}</span>`);
        if (_ctx.isTyping) {
          _push(`<div class="flex items-center gap-1"><div class="flex space-x-1"><div class="w-0.5 h-0.5 bg-gray-500 rounded-full animate-bounce" style="${ssrRenderStyle({ "animation-delay": "0ms" })}"></div><div class="w-0.5 h-0.5 bg-gray-500 rounded-full animate-bounce" style="${ssrRenderStyle({ "animation-delay": "150ms" })}"></div><div class="w-0.5 h-0.5 bg-gray-500 rounded-full animate-bounce" style="${ssrRenderStyle({ "animation-delay": "300ms" })}"></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="flex-1 flex items-center gap-2"><input data-editing="true"${ssrRenderAttr("value", unref(editingTitle))} class="flex-1 p-0 text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0"></div>`);
      }
      if (!unref(isEditing)) {
        _push(`<div class="relative"><button${ssrRenderAttr("data-session-id", _ctx.session.id)} class="${ssrRenderClass([
          "p-1 rounded hover:bg-gray-300 transition-colors cursor-pointer",
          "md:opacity-0 md:group-hover:opacity-100 opacity-100"
        ])}"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"></path></svg></button>`);
        if (unref(showOptions)) {
          _push(`<div${ssrRenderAttr("data-session-id", _ctx.session.id)} class="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10"><button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path></svg> Rename </button><button class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path></svg> Delete </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/sidebar/SessionItem.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const SCROLL_STORAGE_KEY = "sidebar-scroll-position";
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "SessionList",
  __ssrInlineRender: true,
  emits: ["close", "sessionDelete"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { sessions, activeSessionId, isTypingTitle } = useChat();
    const chatSessionsRef = ref(null);
    const isScrolled = ref(false);
    const getSavedScrollPosition = () => {
      try {
        const saved = sessionStorage.getItem(SCROLL_STORAGE_KEY);
        return saved ? parseInt(saved) : 0;
      } catch {
        return 0;
      }
    };
    const saveScrollPosition = (position) => {
      try {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, position.toString());
      } catch {
      }
    };
    function handleSessionSelect(sessionId) {
      if (chatSessionsRef.value) {
        saveScrollPosition(chatSessionsRef.value.scrollTop);
      }
      navigateTo(`/chat/${sessionId}`);
      emit("close");
    }
    function handleSessionDelete(session) {
      emit("sessionDelete", session);
    }
    function handleSessionRename(data) {
      console.log("Session renamed:", data);
    }
    watch(
      sessions,
      () => {
        nextTick(() => {
          if (chatSessionsRef.value) {
            const savedPosition = getSavedScrollPosition();
            if (savedPosition > 0) {
              chatSessionsRef.value.scrollTop = savedPosition;
            }
          }
        });
      },
      { flush: "post" }
    );
    watch(
      activeSessionId,
      () => {
      },
      { immediate: false }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex-1 flex flex-col min-h-0" }, _attrs))}><div class="${ssrRenderClass([
        "px-4 py-2 bg-white transition-shadow duration-200",
        unref(isScrolled) ? "shadow-sm border-b border-gray-100" : ""
      ])}"><span class="pl-0 py-1 text-xs text-gray-500 block">Chats</span></div><div class="flex-1 overflow-y-auto pt-1 pb-4" style="${ssrRenderStyle({ "min-height": "0" })}">`);
      if (unref(sessions).length === 0) {
        _push(`<div class="px-4 py-8 text-center"><div class="text-gray-400 mb-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 mx-auto"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"></path></svg></div><p class="text-sm text-gray-500">No chats yet</p><p class="text-xs text-gray-400 mt-1">Start a new conversation</p></div>`);
      } else {
        _push(`<div class="space-y-1"><!--[-->`);
        ssrRenderList(unref(sessions), (session) => {
          _push(ssrRenderComponent(_sfc_main$6, {
            key: session.id,
            session,
            isActive: session.id === unref(activeSessionId),
            isTyping: unref(isTypingTitle) === session.id,
            onSelect: handleSessionSelect,
            onDelete: handleSessionDelete,
            onRename: handleSessionRename
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/sidebar/SessionList.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SidebarFooter",
  __ssrInlineRender: true,
  setup(__props) {
    const { user } = useAuth();
    computed(() => {
      const userData2 = user.value;
      if (!(userData2 == null ? void 0 : userData2.name)) return "U";
      return userData2.name.split(" ").map((name) => name[0]).join("").toUpperCase().slice(0, 2);
    });
    computed(() => user.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0;
      _push(ssrRenderComponent(_component_ClientOnly, _attrs, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-2 border-t border-gray-200 mt-auto"${_scopeId}><div class="flex items-center gap-3 p-2 rounded-lg"${_scopeId}><div class="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"${_scopeId}></div><div class="flex-1 min-w-0"${_scopeId}><div class="h-4 bg-gray-200 rounded animate-pulse mb-1"${_scopeId}></div><div class="h-3 bg-gray-200 rounded animate-pulse w-2/3"${_scopeId}></div></div><div class="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"${_scopeId}></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-2 border-t border-gray-200 mt-auto" }, [
                createVNode("div", { class: "flex items-center gap-3 p-2 rounded-lg" }, [
                  createVNode("div", { class: "w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 animate-pulse" }),
                  createVNode("div", { class: "flex-1 min-w-0" }, [
                    createVNode("div", { class: "h-4 bg-gray-200 rounded animate-pulse mb-1" }),
                    createVNode("div", { class: "h-3 bg-gray-200 rounded animate-pulse w-2/3" })
                  ]),
                  createVNode("div", { class: "w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 animate-pulse" })
                ])
              ])
            ];
          }
        })
      }, _parent));
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/sidebar/SidebarFooter.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SessionDeleteModal",
  __ssrInlineRender: true,
  props: {
    isOpen: { type: Boolean },
    session: {}
  },
  emits: ["close", "confirm"],
  setup(__props, { emit: __emit }) {
    useChat();
    const isDeletingSession = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      if (_ctx.isOpen) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" }, _attrs))}><div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"><h3 class="text-lg font-semibold text-gray-900 mb-4">Delete chat?</h3><p class="text-gray-600 mb-6"> This will delete <span class="font-medium text-gray-900">&quot;${ssrInterpolate((_a = _ctx.session) == null ? void 0 : _a.title)}&quot;</span></p><div class="flex gap-3 justify-end"><button${ssrIncludeBooleanAttr(unref(isDeletingSession)) ? " disabled" : ""} class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"> Cancel </button><button${ssrIncludeBooleanAttr(unref(isDeletingSession)) ? " disabled" : ""} class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 cursor-pointer rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">`);
        if (unref(isDeletingSession)) {
          _push(`<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(isDeletingSession) ? "Deleting..." : "Delete")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/sidebar/SessionDeleteModal.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ChatSidebar",
  __ssrInlineRender: true,
  props: {
    isOpen: { type: Boolean }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const showDeleteModal = ref(false);
    const sessionToDelete = ref(null);
    ref(null);
    function handleSessionDelete(session) {
      sessionToDelete.value = session;
      showDeleteModal.value = true;
    }
    function handleDeleteModalClose() {
      showDeleteModal.value = false;
      sessionToDelete.value = null;
    }
    async function handleDeleteConfirm(data) {
      showDeleteModal.value = false;
      sessionToDelete.value = null;
      if (data.isActiveSession) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await navigateTo("/chat");
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))}>`);
      if (props.isOpen) {
        _push(`<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] md:hidden"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<aside class="${ssrRenderClass([
        "fixed md:relative inset-y-0 left-0 z-[60] w-64 bg-white border-r border-gray-200 flex flex-col h-full transition-transform duration-300 ease-in-out md:translate-x-0",
        props.isOpen ? "translate-x-0" : "-translate-x-full"
      ])}">`);
      _push(ssrRenderComponent(_sfc_main$8, {
        onClose: ($event) => emit("close")
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$7, {
        onClose: ($event) => emit("close")
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$5, {
        onClose: ($event) => emit("close"),
        onSessionDelete: handleSessionDelete
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$4, null, null, _parent));
      _push(`</aside>`);
      _push(ssrRenderComponent(_sfc_main$3, {
        isOpen: unref(showDeleteModal),
        session: unref(sessionToDelete),
        onClose: handleDeleteModalClose,
        onConfirm: handleDeleteConfirm
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChatSidebar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChatInputPanel",
  __ssrInlineRender: true,
  props: {
    modelOptions: {},
    modelValue: {},
    showThumbnails: { type: Boolean }
  },
  emits: ["update:modelValue", "start-recording", "send", "preview-image", "preview-pdf", "update:showThumbnails"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { uploadedFiles, input, isLoading } = useChat();
    const selectedModelLocal = ref(props.modelValue);
    watch(selectedModelLocal, (v) => emit("update:modelValue", v));
    watch(
      () => props.modelValue,
      (v) => {
        if (v !== selectedModelLocal.value) selectedModelLocal.value = v;
      }
    );
    const showFilesMenu = ref(false);
    ref(null);
    ref(null);
    ref(null);
    const audioStates = reactive({});
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "border rounded-lg px-2 py-2" }, _attrs))}><div style="${ssrRenderStyle(unref(uploadedFiles).length && _ctx.showThumbnails ? null : { display: "none" })}" class="flex flex-row gap-2 items-center px-2 pb-2 shadow-md flex-wrap"><!--[-->`);
      ssrRenderList(unref(uploadedFiles), (file, idx) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
        _push(`<!--[-->`);
        if (file.isImage) {
          _push(`<div class="relative group"><img${ssrRenderAttr("src", file.previewUrl)} alt="preview" class="w-16 h-16 object-cover rounded cursor-pointer border border-gray-300"><button class="absolute top-0.5 right-0.5 bg-white rounded-full border border-gray-300 w-4 h-4 flex items-center justify-center text-xs text-gray-700 opacity-80 cursor-pointer group-hover:opacity-100" title="Hapus file"> \u2715 </button></div>`);
        } else if (file.isPdf) {
          _push(`<div class="relative flex items-center gap-2 cursor-pointer p-2 h-16 border border-gray-300 rounded"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="red" class="w-7 h-7"><path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"></path></svg><span class="text-sm font-medium">${ssrInterpolate(file.name)}</span><button class="absolute top-0.5 right-0.5 bg-white rounded-full border border-gray-300 w-5 h-5 flex items-center justify-center text-xs text-gray-700 opacity-80 cursor-pointer hover:opacity-100" title="Hapus file"> \u2715 </button></div>`);
        } else if (file.isAudio) {
          _push(`<div class="relative flex items-center gap-2 cursor-pointer p-2 h-16 border border-gray-300 rounded bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-7 h-7 text-blue-600"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path></svg><span class="text-sm font-medium">${ssrInterpolate(file.name)}</span>`);
          if (((_a = audioStates[idx]) == null ? void 0 : _a.status) === "playing") {
            _push(`<!--[--><button class="cursor-pointer" title="Pause"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-5 w-5" fill="#000"><path d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path></svg></button><button class="cursor-pointer" title="Stop"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 -960 960 960" fill="#000"><path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path></svg></button><button${ssrIncludeBooleanAttr((_b = audioStates[idx]) == null ? void 0 : _b.transcribing) ? " disabled" : ""} class="${ssrRenderClass([
              "mr-3",
              ((_c = audioStates[idx]) == null ? void 0 : _c.transcribing) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            ])}" title="Transcribe">`);
            if (!((_d = audioStates[idx]) == null ? void 0 : _d.transcribing)) {
              _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-5 w-5" fill="#000"><path d="M680-560q-33 0-56.5-23T600-640v-160q0-34 23.5-57t56.5-23q34 0 57 23t23 57v160q0 34-23 57t-57 23ZM200-80q-33 0-56.5-23.5T120-160v-640q0-33 23.5-56.5T200-880h320v80H200v640h440v-80h80v80q0 33-23.5 56.5T640-80H200Zm80-160v-80h280v80H280Zm0-120v-80h200v80H280Zm440 40h-80v-104q-77-14-128.5-74.5T460-640h80q0 58 41 99t99 41q59 0 99.5-41t40.5-99h80q0 81-51 141.5T720-424v104Z"></path></svg>`);
            } else {
              _push(`<svg class="animate-spin h-5 w-5 text-gray-700" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>`);
            }
            _push(`</button><!--]-->`);
          } else if (((_e = audioStates[idx]) == null ? void 0 : _e.status) === "paused") {
            _push(`<!--[--><button class="cursor-pointer" title="Play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-5 w-5" fill="#000"><path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path></svg></button><button class="cursor-pointer" title="Stop"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 -960 960 960" fill="#000"><path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path></svg></button><button${ssrIncludeBooleanAttr((_f = audioStates[idx]) == null ? void 0 : _f.transcribing) ? " disabled" : ""} class="${ssrRenderClass([
              "mr-3",
              ((_g = audioStates[idx]) == null ? void 0 : _g.transcribing) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            ])}" title="Transcribe">`);
            if (!((_h = audioStates[idx]) == null ? void 0 : _h.transcribing)) {
              _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-5 w-5" fill="#000"><path d="M680-560q-33 0-56.5-23T600-640v-160q0-34 23.5-57t56.5-23q34 0 57 23t23 57v160q0 34-23 57t-57 23ZM200-80q-33 0-56.5-23.5T120-160v-640q0-33 23.5-56.5T200-880h320v80H200v640h440v-80h80v80q0 33-23.5 56.5T640-80H200Zm80-160v-80h280v80H280Zm0-120v-80h200v80H280Zm440 40h-80v-104q-77-14-128.5-74.5T460-640h80q0 58 41 99t99 41q59 0 99.5-41t40.5-99h80q0 81-51 141.5T720-424v104Z"></path></svg>`);
            } else {
              _push(`<svg class="animate-spin h-5 w-5 text-gray-700" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>`);
            }
            _push(`</button><!--]-->`);
          } else {
            _push(`<!--[--><button class="cursor-pointer" title="Play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-5 w-5" fill="#000"><path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path></svg></button><button${ssrIncludeBooleanAttr((_i = audioStates[idx]) == null ? void 0 : _i.transcribing) ? " disabled" : ""} class="${ssrRenderClass([
              "mr-3",
              ((_j = audioStates[idx]) == null ? void 0 : _j.transcribing) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            ])}" title="Transcribe">`);
            if (!((_k = audioStates[idx]) == null ? void 0 : _k.transcribing)) {
              _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-5 w-5" fill="#000"><path d="M680-560q-33 0-56.5-23T600-640v-160q0-34 23.5-57t56.5-23q34 0 57 23t23 57v160q0 34-23 57t-57 23ZM200-80q-33 0-56.5-23.5T120-160v-640q0-33 23.5-56.5T200-880h320v80H200v640h440v-80h80v80q0 33-23.5 56.5T640-80H200Zm80-160v-80h280v80H280Zm0-120v-80h200v80H280Zm440 40h-80v-104q-77-14-128.5-74.5T460-640h80q0 58 41 99t99 41q59 0 99.5-41t40.5-99h80q0 81-51 141.5T720-424v104Z"></path></svg>`);
            } else {
              _push(`<svg class="animate-spin h-5 w-5 text-gray-700" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>`);
            }
            _push(`</button><!--]-->`);
          }
          _push(`<button class="absolute top-0.5 right-0.5 bg-white rounded-full border border-gray-300 w-5 h-5 flex items-center justify-center text-xs text-gray-700 opacity-80 cursor-pointer hover:opacity-100" title="Hapus file"> \u2715 </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div><input type="file" accept="image/*,application/pdf,audio/*" multiple class="hidden"><textarea placeholder="Ketik pesan..." class="w-full border-none outline-none px-2 resize-none min-h-[40px] max-h-[192px] overflow-y-auto bg-transparent pt-2"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""} rows="1" style="${ssrRenderStyle({ "line-height": "1.5" })}">${ssrInterpolate(unref(input))}</textarea><div class="flex flex-row justify-between items-center"><div class="flex justify-start mt-2"><div class="relative"><button type="button" class="${ssrRenderClass([
        "flex items-center justify-center w-7 h-7 rounded-full cursor-pointer hover:bg-gray-200",
        showFilesMenu.value ? "bg-gray-200" : ""
      ])}" title="Add Files and more /"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-2 text-gray-900" viewBox="0 -960 960 960" fill="#000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"></path></svg></button>`);
      if (showFilesMenu.value) {
        _push(`<div class="absolute left-0 bottom-full mb-2 z-10 bg-white border rounded-lg shadow-lg p-2 w-60 flex flex-col gap-2"><button type="button" class="flex flex-row w-full text-left px-3 py-2 rounded cursor-pointer hover:bg-gray-100 text-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 -960 960 960"><path d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z"></path></svg><span> Add photos &amp; files </span></button><button type="button" class="flex flex-row w-full text-left px-3 py-2 rounded cursor-pointer hover:bg-gray-100 text-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 -960 960 960"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"></path></svg><span> Create Image </span></button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="ml-2"><label for="model-switcher" class="text-xs text-gray-500 mr-2"> Model: </label><select id="model-switcher" class="border rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><!--[-->`);
      ssrRenderList(_ctx.modelOptions, (opt) => {
        _push(`<option${ssrRenderAttr("value", opt.value)}${ssrIncludeBooleanAttr(Array.isArray(selectedModelLocal.value) ? ssrLooseContain(selectedModelLocal.value, opt.value) : ssrLooseEqual(selectedModelLocal.value, opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
      });
      _push(`<!--]--></select></div></div><div></div><div class="flex justify-end mt-2"><button type="button" class="mr-2 hover:bg-gray-200 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer" title="Rekam suara"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000" class="h-5 w-5 stroke-2 text-gray-900"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"></path></svg></button><button type="button"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""} class="${ssrRenderClass([
        "flex items-center justify-center w-7 h-7 hover:bg-gray-200 rounded-full cursor-pointer"
      ])}" title="Kirim">`);
      if (unref(isLoading)) {
        _push(`<svg class="animate-spin h-5 w-5 text-gray-700" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>`);
      } else {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000" class="h-5 w-5 stroke-2"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"></path></svg>`);
      }
      _push(`</button></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChatInputPanel.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "RecordingPanel",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    waveHeight: {}
  },
  emits: ["update:modelValue", "transcribed", "error"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const waveHeight = computed(() => {
      var _a;
      return Math.max(32, (_a = props.waveHeight) != null ? _a : 5);
    });
    const emit = __emit;
    const wavesurferRef = ref(null);
    let wavesurfer = null;
    let record = null;
    const isRecording = ref(false);
    const recordedAudio = ref("");
    const audioBlob = ref(null);
    const isTranscribing = ref(false);
    const pendingConfirm = ref(false);
    watch(
      () => props.modelValue,
      async (val) => {
        if (val) {
          await startRecording();
        } else {
          cleanup();
        }
      }
    );
    async function startRecording() {
      cleanup();
      if (wavesurferRef.value) {
        wavesurfer = WaveSurfer.create({
          container: wavesurferRef.value,
          waveColor: "rgba(0, 0, 0, 0.5)",
          progressColor: "rgba(0, 0, 0, 0.5)",
          height: waveHeight.value,
          normalize: true
        });
        record = wavesurfer.registerPlugin(
          RecordPlugin.create({
            renderRecordedAudio: false,
            scrollingWaveform: true,
            continuousWaveform: false
          })
        );
        record.on("record-end", (blob) => {
          audioBlob.value = blob;
          const reader = new FileReader();
          reader.onload = async () => {
            recordedAudio.value = reader.result;
            stopVisualizer();
            if (pendingConfirm.value) {
              pendingConfirm.value = false;
              await doTranscribe();
            }
          };
          reader.readAsDataURL(blob);
        });
        await record.startRecording();
        isRecording.value = true;
      }
    }
    function stopVisualizer() {
      if (wavesurfer) {
        wavesurfer.destroy();
        wavesurfer = null;
        record = null;
      }
      isRecording.value = false;
    }
    async function doTranscribe() {
      if (!recordedAudio.value) return;
      isTranscribing.value = true;
      await transcribeAudio(recordedAudio.value);
      isTranscribing.value = false;
      emit("update:modelValue", false);
    }
    async function transcribeAudio(audioBase64) {
      var _a, _b;
      try {
        const res = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioBase64 })
        });
        const data = await res.json();
        if (!res.ok) {
          if (((_a = data.error) == null ? void 0 : _a.code) === "insufficient_quota") {
            toast.error("Kouta untuk request penuh.", {
              position: "top-right",
              autoClose: 5e3
            });
          } else {
            toast.error(((_b = data.error) == null ? void 0 : _b.message) || "Gagal transkripsi audio", {
              position: "top-right",
              autoClose: 5e3
            });
          }
          return;
        }
        if (data.text) {
          emit("transcribed", data.text);
          toast.success("Audio berhasil ditranskripsi!", {
            position: "top-right",
            autoClose: 3e3
          });
        } else {
          toast.warning("Tidak ada teks yang terdeteksi dari audio", {
            position: "top-right",
            autoClose: 4e3
          });
        }
      } catch (e) {
        toast.error(e.message || "Gagal transkripsi audio", {
          position: "top-right",
          autoClose: 5e3
        });
      }
    }
    function cleanup() {
      stopVisualizer();
      recordedAudio.value = "";
      audioBlob.value = null;
      isTranscribing.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        style: [
          _ctx.modelValue ? null : { display: "none" },
          { minHeight: waveHeight.value + 32 + "px" }
        ],
        class: "rounded-full border p-4 bg-white flex flex-row items-center justify-between gap-2"
      }, _attrs))}><div class="flex justify-start gap-2 items-center"><button type="button" class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-200 cursor-not-allowed" title="Add Files and more /" disabled><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-2 text-gray-900" viewBox="0 -960 960 960" fill="#000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"></path></svg></button></div><div class="flex-1 flex flex-col justify-center px-2 items-stretch"><div style="${ssrRenderStyle([
        isRecording.value ? null : { display: "none" },
        { height: waveHeight.value + "px" }
      ])}" class="w-full rounded-lg overflow-hidden"></div>`);
      if (!isRecording.value) {
        _push(`<div class="w-full flex flex-col items-center">`);
        if (recordedAudio.value) {
          _push(`<span class="text-gray-400 text-sm">Mohon tunggu, sedang melakukan Transkripsi</span>`);
        } else {
          _push(`<div class="text-xs text-gray-500 text-center">Siap merekam</div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex justify-end gap-2 items-center"><button type="button" class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-200 cursor-pointer" title="Cancel"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-5 w-5" fill="#000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path></svg></button><button type="button" class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"${ssrRenderAttr("title", isRecording.value ? "Stop & Transcribe" : "Transcribe")}${ssrIncludeBooleanAttr(isTranscribing.value) ? " disabled" : ""}>`);
      if (!isTranscribing.value) {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-5 w-5" fill="#000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"></path></svg>`);
      } else {
        _push(`<svg class="animate-spin h-5 w-5 text-gray-700" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>`);
      }
      _push(`</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RecordingPanel.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main$2 as _, _sfc_main as a, _sfc_main$1 as b, setInterval as s, useChat as u };
//# sourceMappingURL=RecordingPanel-nnLISRZO.mjs.map

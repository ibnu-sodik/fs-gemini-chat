import { u as useNuxtApp, _ as __nuxt_component_0$1 } from './server.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { marked } from 'marked';
import { u as useChat, _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$1$1, s as setInterval } from './RecordingPanel-nnLISRZO.mjs';
import '../_/nitro.mjs';
import '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@logto/node';
import '@silverhand/essentials';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'wavesurfer.js';
import 'wavesurfer.js/dist/plugins/record.esm.js';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const router = useRouter();
    const isSidebarOpen = ref(false);
    const showRecording = ref(false);
    const { $config } = useNuxtApp();
    const appName = $config.public.appName;
    const showThumbnails = ref(false);
    const displayedContent = ref({});
    ref(null);
    const isAnimating = ref(false);
    const {
      messages,
      input,
      isLoading,
      activeSessionId,
      uploadedFiles,
      setModel,
      clearState,
      autoRenameSession,
      generateTitleWithLLM,
      autoRenameSessionWithTitle
    } = useChat();
    clearState();
    displayedContent.value = {};
    const modelOptions = [
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" }
    ];
    const selectedModel = ref(modelOptions[0].value);
    async function handleSend() {
      if (!showRecording.value && input.value.trim()) {
        showThumbnails.value = false;
        const userMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content: input.value.trim(),
          files: uploadedFiles.value.length > 0 ? [...uploadedFiles.value] : void 0
        };
        messages.value.push(userMessage);
        displayedContent.value[userMessage.id] = userMessage.content;
        isLoading.value = true;
        const currentInput = input.value.trim();
        input.value = "";
        uploadedFiles.value = [];
        try {
          if (!activeSessionId.value) {
            const sessionId = await createNewSession();
            activeSessionId.value = sessionId;
            await router.push(`/chat/${sessionId}`);
          }
          await sendMessageToBackend(currentInput, userMessage);
        } catch (error) {
          console.error("Error in handleSend:", error);
          toast.error("Failed to send message", {
            position: "top-center",
            autoClose: 3e3
          });
          const msgIndex = messages.value.findIndex((m) => m.id === userMessage.id);
          if (msgIndex !== -1) {
            messages.value.splice(msgIndex, 1);
            delete displayedContent.value[userMessage.id];
          }
        } finally {
          isLoading.value = false;
        }
      }
    }
    async function createNewSession() {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat"
          // Temporary title
        })
      });
      if (!res.ok) {
        throw new Error("Failed to create session");
      }
      const data = await res.json();
      const { sessions: sessions2 } = useChat();
      sessions2.value.unshift({
        id: data.session.id,
        title: "New Chat"
      });
      return data.session.id;
    }
    async function sendMessageToBackend(messageContent, userMessage) {
      const loadingMsg = {
        id: "loading",
        role: "assistant",
        content: "\u25CF\u25CF\u25CF",
        isAIResponse: true
      };
      messages.value.push(loadingMsg);
      displayedContent.value[loadingMsg.id] = "\u25CF\u25CF\u25CF";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageContent,
            sessionId: activeSessionId.value,
            model: selectedModel.value,
            files: userMessage.files || []
          })
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const loadingIndex = messages.value.findIndex((m) => m.id === "loading");
        if (loadingIndex !== -1) {
          messages.value.splice(loadingIndex, 1);
          delete displayedContent.value["loading"];
        }
        const responseContent = data.response || data.message || data.content || data.text || "[No response from AI]";
        const assistantMsg = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: responseContent,
          isAIResponse: data.isAIResponse || true
          // Use from API or default to true
        };
        messages.value.push(assistantMsg);
        const messageCount = messages.value.filter((m) => m.role === "user").length;
        if (messageCount === 1) {
          try {
            const generatedTitle = await generateTitleWithLLM(
              messageContent,
              selectedModel.value
            );
            await autoRenameSessionWithTitle(activeSessionId.value, generatedTitle);
          } catch (error) {
            console.error("LLM title generation failed, using fallback:", error);
            await autoRenameSession(activeSessionId.value, messageContent);
          }
        }
        animateMessage(assistantMsg.id, assistantMsg.content);
      } catch (error) {
        const loadingIndex = messages.value.findIndex((m) => m.id === "loading");
        if (loadingIndex !== -1) {
          messages.value.splice(loadingIndex, 1);
          delete displayedContent.value["loading"];
        }
        throw error;
      }
    }
    function animateMessage(id, content) {
      isAnimating.value = true;
      displayedContent.value[id] = "";
      setInterval();
    }
    function onTranscribed(text) {
      input.value = text;
    }
    function onRecordingError(message) {
      toast.error(message, {
        position: "top-right",
        autoClose: 5e3
      });
    }
    function openImageModal(url) {
      console.log("Image preview:", url);
    }
    function openPdfModal(url) {
      console.log("PDF preview:", url);
    }
    function formatMessage(text) {
      return marked.parse(text);
    }
    setModel(selectedModel.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex h-screen bg-gray-50 overflow-hidden" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$2, {
        "is-open": isSidebarOpen.value,
        onClose: ($event) => isSidebarOpen.value = false
      }, null, _parent));
      _push(`<div class="flex-1 flex flex-col h-full min-h-0"><header class="flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm"><div class="flex items-center gap-2"><button class="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors touch-manipulation" type="button" aria-label="Toggle sidebar" style="${ssrRenderStyle({ "user-select": "none", "-webkit-tap-highlight-color": "transparent" })}"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg></button><span class="font-semibold text-gray-900">${ssrInterpolate(unref(appName))}</span></div><div class="hidden md:flex items-center gap-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u2190 Back to Home `);
          } else {
            return [
              createTextVNode(" \u2190 Back to Home ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></header><div class="flex-1 min-h-0 flex flex-col"><div class="flex-1 overflow-y-auto p-6 space-y-4" style="${ssrRenderStyle({ "min-height": "0" })}">`);
      if (unref(messages).length === 0) {
        _push(`<div class="h-full flex items-center justify-center"><div class="text-center max-w-md mx-auto p-8"><div class="w-16 h-16 bg-gradient-to-bl from-gray-100 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></div><h2 class="text-2xl font-bold text-gray-900 mb-2"> Start a New Conversation </h2><p class="text-gray-600 mb-6"> Type a message below to start chatting with Gemini AI. A new chat session will be created automatically. </p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(messages), (m, idx) => {
        var _a;
        _push(`<div class="${ssrRenderClass([
          "px-4 py-2 w-fit ",
          m.role === "user" ? "max-w-[80vw] md:max-w-xl rounded-lg shadow ml-auto bg-gray-200 text-gray-900" : "mr-auto"
        ])}">`);
        if (m.role === "user") {
          _push(`<!--[-->`);
          if (m.files && m.files.length) {
            _push(`<!--[--><div class="flex flex-row gap-2 items-center flex-wrap mb-2"><!--[-->`);
            ssrRenderList(m.files, (file, fidx) => {
              _push(`<!--[-->`);
              if (file.type && file.type.startsWith("image")) {
                _push(`<img${ssrRenderAttr("src", file.base64)} alt="preview" class="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer">`);
              } else {
                _push(`<div class="flex items-center gap-2 cursor-pointer p-2 h-16 border border-gray-300 rounded"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="red" class="w-7 h-7"><path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"></path></svg><span class="text-sm font-medium">${ssrInterpolate(file.name)}</span></div>`);
              }
              _push(`<!--]-->`);
            });
            _push(`<!--]--></div>`);
            if (m.content) {
              _push(`<span>${ssrInterpolate(m.content)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<span>${ssrInterpolate(m.content)}</span>`);
          }
          _push(`<!--]-->`);
        } else if (m.id === "loading") {
          _push(`<span><span class="flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg><span class="text-gray-500">Gemini is typing...</span></span></span>`);
        } else if (m.role === "assistant") {
          _push(`<span>${(_a = formatMessage(displayedContent.value[m.id] || "")) != null ? _a : ""}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div><div class="px-2 sm:px-4 lg:px-24 xl:px-36 2xl:px-48 pb-4 pt-1 shadow-xl">`);
      _push(ssrRenderComponent(_sfc_main$1, {
        modelValue: showRecording.value,
        "onUpdate:modelValue": ($event) => showRecording.value = $event,
        "wave-height": 10,
        onTranscribed,
        onError: onRecordingError
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1$1, {
        style: !showRecording.value ? null : { display: "none" },
        modelValue: selectedModel.value,
        "onUpdate:modelValue": ($event) => selectedModel.value = $event,
        "model-options": modelOptions,
        "show-thumbnails": showThumbnails.value,
        "onUpdate:showThumbnails": (v) => showThumbnails.value = v,
        onStartRecording: () => showRecording.value = true,
        onPreviewImage: openImageModal,
        onPreviewPdf: openPdfModal,
        onSend: handleSend
      }, null, _parent));
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/chat/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bjd-C2N_.mjs.map

import { a as useRoute, b as useRouter, u as useNuxtApp, _ as __nuxt_component_0$1 } from './server.mjs';
import { defineComponent, computed, watch, ref, mergeProps, unref, withCtx, createTextVNode, nextTick, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { toast } from 'vue3-toastify';
import { u as useChat, _ as _sfc_main$2, s as setInterval, a as _sfc_main$3, b as _sfc_main$1$1 } from './RecordingPanel-nnLISRZO.mjs';
import { marked } from 'marked';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import 'vue-router';
import 'wavesurfer.js';
import 'wavesurfer.js/dist/plugins/record.esm.js';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChatWindow",
  __ssrInlineRender: true,
  setup(__props) {
    const showRecording = ref(false);
    const showThumbnails = ref(false);
    const {
      messages,
      input,
      send,
      setModel,
      isLoadingSession
    } = useChat();
    const chatListRef = ref(null);
    const displayedContent = ref({});
    ref(null);
    const isUserManuallyScrolling = ref(false);
    const isTyping = ref(false);
    const showScrollToBottomButton = ref(false);
    const shouldAutoScroll = ref(true);
    ref(null);
    const isProgrammaticScroll = ref(false);
    const modelOptions = [
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" }
    ];
    const selectedModel = ref(modelOptions[0].value);
    ref(false);
    const showImageModal = ref(false);
    const showPdfModal = ref(false);
    const modalImageUrl = ref("");
    const modalPdfUrl = ref("");
    const pdfLoadError = ref(false);
    watch(
      messages,
      (newMessages) => {
        showThumbnails.value = false;
        if (!isLoadingSession.value) {
          scrollToBottom();
        }
        newMessages.forEach((msg) => {
          if (!msg.isAIResponse) {
            displayedContent.value[msg.id] = msg.content;
          }
        });
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === "assistant" && lastMsg.isAIResponse && !displayedContent.value[lastMsg.id]) {
          animateMessage(lastMsg.id, lastMsg.content);
        }
      },
      { deep: true }
    );
    watch(isLoadingSession, (loading, wasLoading) => {
      if (wasLoading && !loading && messages.value.length > 0) {
        nextTick(() => {
          scrollToBottom({ instant: true });
        });
      }
    });
    watch(selectedModel, (val) => {
      if (val) setModel(val);
    });
    function handleSend() {
      if (!showRecording.value) {
        showThumbnails.value = false;
        shouldAutoScroll.value = true;
        showScrollToBottomButton.value = false;
        isUserManuallyScrolling.value = false;
        isProgrammaticScroll.value = false;
        send();
        nextTick(() => scrollToBottom({ instant: false }));
      }
    }
    function openImageModal(url) {
      modalImageUrl.value = url;
      showImageModal.value = true;
    }
    function openPdfModal(url) {
      modalPdfUrl.value = url;
      pdfLoadError.value = false;
      showPdfModal.value = true;
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
    function scrollToBottom(opts = {}) {
      if (!shouldAutoScroll.value && !opts.instant) {
        return;
      }
      nextTick(() => {
        requestAnimationFrame(() => {
          const el = chatListRef.value;
          if (!el) return;
          const top = el.scrollHeight;
          try {
            el.scrollTo({ top, behavior: opts.instant ? "auto" : "smooth" });
          } catch {
            el.scrollTop = top;
          }
        });
      });
    }
    function formatAI(text) {
      return marked.parse(text);
    }
    function animateMessage(id, content) {
      displayedContent.value[id] = "";
      isTyping.value = true;
      setInterval();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full bg-white flex flex-col relative" }, _attrs))} data-v-44f6d91a><div class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:px-24 xl:px-36 2xl:px-48 space-y-4" style="${ssrRenderStyle({ "min-height": "0" })}" data-v-44f6d91a>`);
      if (unref(messages).length === 0) {
        _push(`<div class="h-full flex items-center justify-center" data-v-44f6d91a><div class="text-center max-w-md mx-auto p-8" data-v-44f6d91a><div class="w-16 h-16 bg-gradient-to-bl from-gray-100 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4" data-v-44f6d91a><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-44f6d91a><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" data-v-44f6d91a></path></svg></div><h2 class="text-2xl font-bold text-gray-900 mb-2" data-v-44f6d91a> Start a New Conversation </h2><p class="text-gray-600 mb-6" data-v-44f6d91a> Type a message below to start chatting with Gemini AI. Continue your conversation in this session. </p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(messages), (m, idx) => {
        var _a;
        _push(`<div class="${ssrRenderClass([
          "px-4 py-2 break-words",
          m.role === "user" ? "max-w-[85%] sm:max-w-[80%] md:max-w-xl rounded-lg shadow ml-auto bg-gray-200 text-gray-900 w-fit" : "w-full"
        ])}" data-v-44f6d91a>`);
        if (m.role === "user") {
          _push(`<!--[-->`);
          if (m.files && m.files.length) {
            _push(`<!--[--><div class="flex flex-row gap-2 items-center flex-wrap mb-2" data-v-44f6d91a><!--[-->`);
            ssrRenderList(m.files, (file, fidx) => {
              _push(`<!--[-->`);
              if (file.type && file.type.startsWith("image")) {
                _push(`<img${ssrRenderAttr("src", file.base64)} alt="preview" class="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer" data-v-44f6d91a>`);
              } else {
                _push(`<div class="flex items-center gap-2 cursor-pointer p-2 h-16 border border-gray-300 rounded" data-v-44f6d91a><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="red" class="w-7 h-7" data-v-44f6d91a><path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" data-v-44f6d91a></path></svg><span class="text-sm font-medium" data-v-44f6d91a>${ssrInterpolate(file.name)}</span></div>`);
              }
              _push(`<!--]-->`);
            });
            _push(`<!--]--></div>`);
            if (m.content) {
              _push(`<span data-v-44f6d91a>${ssrInterpolate(m.content)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<span data-v-44f6d91a>${ssrInterpolate(m.content)}</span>`);
          }
          _push(`<!--]-->`);
        } else if (m.id === "loading") {
          _push(`<span data-v-44f6d91a><span class="flex items-center gap-2" data-v-44f6d91a><svg class="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24" data-v-44f6d91a><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" data-v-44f6d91a></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" data-v-44f6d91a></path></svg><span class="text-gray-500" data-v-44f6d91a>Gemini is typing...</span></span></span>`);
        } else if (m.role === "assistant") {
          _push(`<div class="prose max-w-none overflow-hidden" data-v-44f6d91a>${(_a = formatAI(displayedContent.value[m.id] || "")) != null ? _a : ""}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
      if (showScrollToBottomButton.value) {
        _push(`<button class="${ssrRenderClass([{ "animate-pulse": isTyping.value }, "absolute cursor-pointer bottom-32 left-1/2 transform -translate-x-1/2 bg-gray-400 hover:bg-gray-500 text-white p-2 rounded-full shadow-lg z-10 flex items-center gap-2"])}" data-v-44f6d91a><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-44f6d91a><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" data-v-44f6d91a></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="px-2 sm:px-4 lg:px-24 xl:px-36 2xl:px-48 pb-4 pt-1 shadow-xl" data-v-44f6d91a>`);
      _push(ssrRenderComponent(_sfc_main$3, {
        modelValue: unref(showRecording),
        "onUpdate:modelValue": ($event) => isRef(showRecording) ? showRecording.value = $event : null,
        "wave-height": 10,
        onTranscribed,
        onError: onRecordingError
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1$1, {
        style: !unref(showRecording) ? null : { display: "none" },
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
      _push(`</div>`);
      if (showImageModal.value) {
        _push(`<div class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" data-v-44f6d91a><div class="bg-white rounded shadow-lg pt-8 px-4 pb-4 relative" data-v-44f6d91a><img${ssrRenderAttr("src", modalImageUrl.value)} alt="preview" class="max-w-[80vw] max-h-[80vh] rounded" data-v-44f6d91a><button class="absolute top-1 right-2 text-gray-700 cursor-pointer hover:text-gray-900" data-v-44f6d91a> \u2715 </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showPdfModal.value) {
        _push(`<div class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" data-v-44f6d91a><div class="bg-white rounded shadow-lg pt-8 px-4 pb-4 relative max-w-[90vw] max-h-[90vh]" data-v-44f6d91a><embed${ssrRenderAttr("src", modalPdfUrl.value)} type="application/pdf" class="w-[70vw] h-[80vh]" data-v-44f6d91a>`);
        if (pdfLoadError.value) {
          _push(`<div class="text-center mt-4" data-v-44f6d91a><p class="text-sm text-gray-700" data-v-44f6d91a> Preview PDF tidak didukung di perangkat ini. </p><a${ssrRenderAttr("href", modalPdfUrl.value)} download class="text-blue-600 underline" data-v-44f6d91a>Download PDF</a></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="absolute top-1 right-2 text-gray-700 cursor-pointer hover:text-gray-900" data-v-44f6d91a> \u2715 </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChatWindow.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ChatWindow = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-44f6d91a"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[sessionId]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    computed(() => route.params.sessionId);
    const { setActiveSession, sessions } = useChat();
    watch(
      () => route.params.sessionId,
      async (newSessionId) => {
        if (newSessionId) {
          try {
            await setActiveSession(newSessionId);
            setTimeout(() => {
              const exists = sessions.value.some((s) => s.id === newSessionId);
              if (!exists && sessions.value.length > 0) {
                toast.error(`Unable to load conversation ${newSessionId}`, {
                  position: "top-center",
                  autoClose: 5e3,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true
                });
                setTimeout(() => {
                  router.push("/chat");
                }, 2e3);
              }
            }, 1e3);
          } catch (error) {
            toast.error(`Unable to load conversation ${newSessionId}`, {
              position: "top-center",
              autoClose: 5e3,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true
            });
            setTimeout(() => {
              router.push("/chat");
            }, 2e3);
          }
        }
      },
      { immediate: true }
    );
    const isSidebarOpen = ref(false);
    const { $config } = useNuxtApp();
    const appName = $config.public.appName;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex h-screen bg-gray-50 overflow-hidden" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$2, {
        "is-open": isSidebarOpen.value,
        onClose: ($event) => isSidebarOpen.value = false
      }, null, _parent));
      _push(`<div class="flex-1 flex flex-col h-full min-h-0"><header class="flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-xl"><div class="flex items-center gap-2"><button class="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors touch-manipulation" type="button" aria-label="Toggle sidebar"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg></button><span class="font-semibold text-gray-900">${ssrInterpolate(unref(appName))}</span></div><div class="hidden md:flex items-center gap-4">`);
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
      _push(`</div></header><div class="flex-1 min-h-0">`);
      _push(ssrRenderComponent(ChatWindow, null, null, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/chat/[sessionId].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_sessionId_-DPdbr6pz.mjs.map

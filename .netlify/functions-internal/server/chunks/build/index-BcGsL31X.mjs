import { u as useNuxtApp, _ as __nuxt_component_0$1 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { $config } = useNuxtApp();
    $config.public.appName;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" }, _attrs))}><main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"><div class="text-center"><h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6"> Chat with <span class="text-blue-600">Gemini AI</span></h1><p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"> Experience the power of Google&#39;s Gemini AI in a beautiful, intuitive chat interface. Upload files, record audio, and get intelligent responses instantly. </p><div class="flex flex-col sm:flex-row gap-4 justify-center">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/chat",
        class: "bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Start Chatting Now `);
          } else {
            return [
              createTextVNode(" Start Chatting Now ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<a href="#features" class="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"> Learn More </a></div></div><section id="features" class="mt-20"><div class="text-center mb-16"><h2 class="text-3xl font-bold text-gray-900 mb-4"> Powerful Features </h2><p class="text-gray-600 max-w-2xl mx-auto"> Everything you need for intelligent conversations with AI </p></div><div class="grid md:grid-cols-3 gap-8"><div class="bg-white rounded-lg p-6 shadow-lg"><div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></div><h3 class="text-xl font-semibold text-gray-900 mb-2"> Smart Conversations </h3><p class="text-gray-600"> Engage in natural conversations with Google&#39;s advanced Gemini AI models with context awareness. </p></div><div class="bg-white rounded-lg p-6 shadow-lg"><div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4"><svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4L5 6v12a2 2 0 002 2h10a2 2 0 002-2V6l-2-2M12 11v4m0 0l-2-2m2 2l2-2"></path></svg></div><h3 class="text-xl font-semibold text-gray-900 mb-2"> File Upload </h3><p class="text-gray-600"> Upload images, PDFs, and documents. Let AI analyze and discuss your files intelligently. </p></div><div class="bg-white rounded-lg p-6 shadow-lg"><div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg></div><h3 class="text-xl font-semibold text-gray-900 mb-2"> Voice Recording </h3><p class="text-gray-600"> Record audio messages and get them automatically transcribed for seamless voice interactions. </p></div></div></section><section class="mt-20 text-center"><div class="bg-white rounded-lg p-8 shadow-lg max-w-4xl mx-auto"><h3 class="text-2xl font-bold text-gray-900 mb-4"> Ready to Experience AI Chat? </h3><p class="text-gray-600 mb-6"> Join thousands of users already chatting with Gemini AI. Start your conversation today. </p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/chat",
        class: "bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg inline-block"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Launch Chat Interface `);
          } else {
            return [
              createTextVNode(" Launch Chat Interface ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section></main><footer class="bg-white border-t border-gray-200 mt-20"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="text-center text-gray-600"><p>\xA9 2025 Gemini Chat. Powered by Google Gemini AI.</p></div></div></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BcGsL31X.mjs.map

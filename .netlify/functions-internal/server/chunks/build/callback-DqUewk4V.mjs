import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { a as useRoute } from './server.mjs';
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
  __name: "callback",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const isError = ref(false);
    const errorMessage = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" }, _attrs))}><div class="max-w-md w-full space-y-8"><div><h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">${ssrInterpolate(unref(isError) ? "Authentication Error" : "Processing Authentication")}</h2><p class="mt-2 text-center text-sm text-gray-600">${ssrInterpolate(unref(errorMessage) || "Memproses autentikasi...")}</p></div><div class="flex justify-center">`);
      if (!unref(isError)) {
        _push(`<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>`);
      } else {
        _push(`<div class="text-center"><div class="text-red-500 text-4xl mb-4">\u26A0\uFE0F</div><button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"> Kembali ke Login </button></div>`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/callback.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=callback-DqUewk4V.mjs.map

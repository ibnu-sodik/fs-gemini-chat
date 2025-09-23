import { e as defineNuxtRouteMiddleware, n as navigateTo, u as useNuxtApp } from './server.mjs';
import { ref } from 'vue';
import { L as destr, M as klona, N as parse, O as getRequestHeader, P as isEqual, s as setCookie, e as getCookie, f as deleteCookie } from '../_/nitro.mjs';
import 'vue-router';
import 'vue/server-renderer';
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

function useRequestEvent(nuxtApp) {
  var _a;
  nuxtApp || (nuxtApp = useNuxtApp());
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
const CookieDefaults = {
  path: "/",
  watch: true,
  decode: (val) => destr(decodeURIComponent(val)),
  encode: (val) => encodeURIComponent(typeof val === "string" ? val : JSON.stringify(val))
};
function useCookie(name, _opts) {
  var _a, _b, _c;
  const opts = { ...CookieDefaults, ..._opts };
  (_a = opts.filter) != null ? _a : opts.filter = (key) => key === name;
  const cookies = readRawCookies(opts) || {};
  let delay;
  if (opts.maxAge !== void 0) {
    delay = opts.maxAge * 1e3;
  } else if (opts.expires) {
    delay = opts.expires.getTime() - Date.now();
  }
  const hasExpired = delay !== void 0 && delay <= 0;
  const cookieValue = klona(hasExpired ? void 0 : (_c = cookies[name]) != null ? _c : (_b = opts.default) == null ? void 0 : _b.call(opts));
  const cookie = ref(cookieValue);
  {
    const nuxtApp = useNuxtApp();
    const writeFinalCookieValue = () => {
      if (opts.readonly || isEqual(cookie.value, cookies[name])) {
        return;
      }
      nuxtApp._cookies || (nuxtApp._cookies = {});
      if (name in nuxtApp._cookies) {
        if (isEqual(cookie.value, nuxtApp._cookies[name])) {
          return;
        }
      }
      nuxtApp._cookies[name] = cookie.value;
      writeServerCookie(useRequestEvent(nuxtApp), name, cookie.value, opts);
    };
    const unhook = nuxtApp.hooks.hookOnce("app:rendered", writeFinalCookieValue);
    nuxtApp.hooks.hookOnce("app:error", () => {
      unhook();
      return writeFinalCookieValue();
    });
  }
  return cookie;
}
function readRawCookies(opts = {}) {
  {
    return parse(getRequestHeader(useRequestEvent(), "cookie") || "", opts);
  }
}
function writeServerCookie(event, name, value, opts = {}) {
  if (event) {
    if (value !== null && value !== void 0) {
      return setCookie(event, name, value, opts);
    }
    if (getCookie(event, name) !== void 0) {
      return deleteCookie(event, name, opts);
    }
  }
}
const auth = defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith("/auth/") && to.path !== "/auth/sign-out") {
    return;
  }
  {
    try {
      const logtoSession = useCookie("logto-session", {
        default: () => null,
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });
      if (!logtoSession.value) {
        return navigateTo("/auth/sign-in");
      }
    } catch (error) {
      console.warn("Server-side cookie access failed:", error);
    }
    return;
  }
});

export { auth as default };
//# sourceMappingURL=auth-RLjzeS6q.mjs.map

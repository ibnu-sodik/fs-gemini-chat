import { H as executeAsync } from '../_/nitro.mjs';
import { e as defineNuxtRouteMiddleware, c as useAuth, n as navigateTo } from './server.mjs';
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
import 'vue';
import 'vue-router';
import 'vue/server-renderer';

const guest = defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  const { isAuthenticated, refreshAuth } = useAuth();
  [__temp, __restore] = executeAsync(() => refreshAuth()), await __temp, __restore();
  if (isAuthenticated.value) {
    return navigateTo("/chat");
  }
});

export { guest as default };
//# sourceMappingURL=guest-BcSuyzYf.mjs.map

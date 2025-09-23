import { d as defineEventHandler, a as useRuntimeConfig, f as deleteCookie, b as getRequestURL, c as createError } from '../../../_/nitro.mjs';
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

const signout_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  try {
    deleteCookie(event, "logto-session");
    const baseUrl = getRequestURL(event).origin;
    const postLogoutRedirectUri = `${baseUrl}/`;
    const signOutUrl = `${config.public.logtoEndpoint}/oidc/session/end?` + new URLSearchParams({
      client_id: config.public.logtoAppId,
      post_logout_redirect_uri: postLogoutRedirectUri
    }).toString();
    return {
      success: true,
      signOutUrl
    };
  } catch (error) {
    console.error("Auth signout error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error during sign out"
    });
  }
});

export { signout_post as default };
//# sourceMappingURL=signout.post.mjs.map

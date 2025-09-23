import { d as defineEventHandler, a as useRuntimeConfig, b as getRequestURL, c as createError } from '../../../_/nitro.mjs';
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

const signin_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  try {
    const baseUrl = getRequestURL(event).origin;
    const redirectUri = `${baseUrl}/auth/callback`;
    const signInUrl = `${config.public.logtoEndpoint}/oidc/auth?` + new URLSearchParams({
      client_id: config.public.logtoAppId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      state: generateState()
      // Generate random state untuk security
    }).toString();
    return {
      success: true,
      signInUrl
    };
  } catch (error) {
    console.error("Auth signin error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error during sign in"
    });
  }
});
function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export { signin_post as default };
//# sourceMappingURL=signin.post.mjs.map

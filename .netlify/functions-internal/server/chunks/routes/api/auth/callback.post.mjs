import { d as defineEventHandler, a as useRuntimeConfig, r as readBody, c as createError, b as getRequestURL, s as setCookie } from '../../../_/nitro.mjs';
import { PrismaClient } from '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@logto/node';
import '@silverhand/essentials';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const prisma = new PrismaClient();
const callback_post = defineEventHandler(async (event) => {
  var _a, _b;
  const config = useRuntimeConfig();
  try {
    const body = await readBody(event);
    const { code, state } = body;
    if (!code) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing authorization code"
      });
    }
    const tokenUrl = `${config.public.logtoEndpoint}/oidc/token`;
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.public.logtoAppId,
      client_secret: config.logtoAppSecret,
      code,
      redirect_uri: `${getRequestURL(event).origin}/auth/callback`
    }).toString();
    const tokenResponse = await $fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: tokenBody
    });
    if (!tokenResponse.access_token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to obtain access token"
      });
    }
    const userInfoUrl = `${config.public.logtoEndpoint}/oidc/me`;
    const userInfo = await $fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`
      }
    });
    const dbUser = await prisma.user.upsert({
      where: { logtoId: userInfo.sub },
      create: {
        logtoId: userInfo.sub,
        email: userInfo.email || "",
        name: userInfo.name || ((_a = userInfo.email) == null ? void 0 : _a.split("@")[0]) || "User",
        avatar: userInfo.picture,
        lastLoginAt: /* @__PURE__ */ new Date(),
        isActive: true
      },
      update: {
        email: userInfo.email || "",
        name: userInfo.name || ((_b = userInfo.email) == null ? void 0 : _b.split("@")[0]) || "User",
        avatar: userInfo.picture,
        lastLoginAt: /* @__PURE__ */ new Date()
      }
    });
    console.log("\u2705 User saved to database:", dbUser.email);
    const sessionData = {
      userId: dbUser.id,
      // Use database ID instead of Logto ID
      logtoId: userInfo.sub,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.avatar,
      accessToken: tokenResponse.access_token,
      expiresAt: Date.now() + tokenResponse.expires_in * 1e3
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString(
      "base64"
    );
    setCookie(event, "logto-session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: tokenResponse.expires_in
    });
    return {
      success: true,
      user: {
        id: dbUser.id,
        // Database ID
        logtoId: userInfo.sub,
        // Logto ID
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.avatar
      }
    };
  } catch (error) {
    console.error("Callback error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed"
    };
  } finally {
    await prisma.$disconnect();
  }
});

export { callback_post as default };
//# sourceMappingURL=callback.post.mjs.map

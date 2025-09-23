import { d as defineEventHandler, e as getCookie, f as deleteCookie } from '../../../_/nitro.mjs';
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
const me_get = defineEventHandler(async (event) => {
  var _a;
  try {
    const sessionCookie = getCookie(event, "logto-session");
    if (!sessionCookie) {
      return {
        user: null,
        isAuthenticated: false
      };
    }
    let sessionData;
    try {
      sessionData = JSON.parse(
        Buffer.from(sessionCookie, "base64").toString("utf8")
      );
    } catch {
      deleteCookie(event, "logto-session");
      return {
        user: null,
        isAuthenticated: false
      };
    }
    if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
      deleteCookie(event, "logto-session");
      return {
        user: null,
        isAuthenticated: false
      };
    }
    let dbUser = null;
    if (sessionData.userId) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { id: sessionData.userId }
        });
      } catch (error) {
        console.error("Database error:", error);
      }
    }
    if (!dbUser && sessionData.logtoId) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { logtoId: sessionData.logtoId }
        });
      } catch (error) {
        console.error("Database fallback error:", error);
      }
    }
    if (!dbUser && sessionData.logtoId) {
      try {
        dbUser = await prisma.user.create({
          data: {
            logtoId: sessionData.logtoId,
            email: sessionData.email || "",
            name: sessionData.name || ((_a = sessionData.email) == null ? void 0 : _a.split("@")[0]) || "User",
            avatar: sessionData.picture,
            lastLoginAt: /* @__PURE__ */ new Date(),
            isActive: true
          }
        });
        console.log("\u2705 User created from session data:", dbUser.email);
      } catch (error) {
        console.error("User creation error:", error);
      }
    }
    const user = dbUser ? {
      id: dbUser.id,
      logtoId: dbUser.logtoId,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.avatar
    } : {
      id: sessionData.userId,
      logtoId: sessionData.logtoId,
      email: sessionData.email,
      name: sessionData.name,
      picture: sessionData.picture
    };
    return {
      user,
      isAuthenticated: true
    };
  } catch (error) {
    console.error("Auth me error:", error);
    return {
      user: null,
      isAuthenticated: false
    };
  } finally {
    await prisma.$disconnect();
  }
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map

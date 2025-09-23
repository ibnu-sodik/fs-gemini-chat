import { d as defineEventHandler, r as readBody, i as getAuthenticatedUserId, c as createError } from '../../_/nitro.mjs';
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
const sessions_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const userId = await getAuthenticatedUserId(event);
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized - Please login first"
      });
    }
    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: body.title || "New Chat"
      },
      select: { id: true, title: true }
    });
    return { session };
  } catch (error) {
    console.error("Create session error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create session"
    });
  } finally {
    await prisma.$disconnect();
  }
});

export { sessions_post as default };
//# sourceMappingURL=sessions.post.mjs.map

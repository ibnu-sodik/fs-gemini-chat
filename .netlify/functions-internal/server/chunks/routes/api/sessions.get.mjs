import { d as defineEventHandler, i as getAuthenticatedUserId, c as createError } from '../../_/nitro.mjs';
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
const sessions_get = defineEventHandler(async (event) => {
  try {
    const userId = await getAuthenticatedUserId(event);
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized - Please login first"
      });
    }
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" }
    });
    return { sessions };
  } catch (error) {
    console.error("Get sessions error:", error);
    if (error.statusCode === 401) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get sessions"
    });
  } finally {
    await prisma.$disconnect();
  }
});

export { sessions_get as default };
//# sourceMappingURL=sessions.get.mjs.map

import { PrismaClient } from '@prisma/client';
import { d as defineEventHandler, h as getQuery } from '../../_/nitro.mjs';
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
const messages_get = defineEventHandler(async (event) => {
  console.log("=== API /messages called ===");
  try {
    const { sessionId } = getQuery(event);
    console.log("Requested sessionId:", sessionId);
    if (!sessionId || typeof sessionId !== "string") {
      console.log("Invalid sessionId, returning empty messages");
      return { messages: [] };
    }
    if (sessionId.length < 10) {
      console.log("SessionId too short, returning empty messages");
      return { messages: [] };
    }
    console.log("Attempting database query for sessionId:", sessionId);
    const messages = await prisma.message.findMany({
      where: { sessionId: String(sessionId) },
      select: {
        id: true,
        role: true,
        content: true,
        files: {
          select: {
            id: true,
            name: true,
            type: true,
            base64: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });
    console.log(
      "Database query successful, found",
      messages.length,
      "messages"
    );
    return { messages };
  } catch (error) {
    console.error("Database error:", error);
    const { sessionId } = getQuery(event);
    console.log("Falling back to mock data for sessionId:", sessionId);
    return {
      messages: [
        {
          id: "msg-1",
          role: "user",
          content: `Hello from session ${sessionId}!`,
          files: []
        },
        {
          id: "msg-2",
          role: "assistant",
          content: `Hi! This is a test response for session ${sessionId}. The routing is working!`,
          files: []
        }
      ]
    };
  }
});

export { messages_get as default };
//# sourceMappingURL=messages.get.mjs.map

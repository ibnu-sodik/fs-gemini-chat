import { GoogleGenAI } from '@google/genai';
import { d as defineEventHandler, r as readBody, c as createError } from '../../_/nitro.mjs';
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

const chat_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  let prisma2 = null;
  try {
    const body = await readBody(event);
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw createError({ statusCode: 500, message: "Missing GOOGLE_API_KEY" });
    }
    const { PrismaClient } = await import('@prisma/client');
    prisma2 = new PrismaClient();
    const { prompt, message, role, sessionId, model, files } = body;
    const userMessage = prompt || message;
    if (!userMessage && (!files || files.length === 0) || !sessionId) {
      return { response: "", role: "assistant" };
    }
    const session = await prisma2.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true }
    });
    const userId = (session == null ? void 0 : session.userId) || null;
    let aiResponse = "";
    try {
      const genAI = new GoogleGenAI({ apiKey });
      const contents = [{ role: "user", parts: [] }];
      if (userMessage) {
        contents[0].parts.push({ text: userMessage });
      }
      if (files && files.length > 0) {
        files.forEach((file) => {
          contents[0].parts.push({
            text: `File: ${file.name}
Type: ${file.type}
Content: ${file.base64}`
          });
        });
      }
      const result = await genAI.models.generateContent({
        model,
        contents
      });
      aiResponse = ((_e = (_d = (_c = (_b = (_a = result == null ? void 0 : result.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) == null ? void 0 : _d[0]) == null ? void 0 : _e.text) || "";
    } catch (err) {
      console.error("Gemini API Error:", err);
      aiResponse = "[Error memanggil Gemini]";
    }
    let messageRecord = null;
    if (userMessage || files && files.length > 0) {
      messageRecord = await prisma2.message.create({
        data: {
          content: userMessage || "[File only]",
          role: "user",
          sessionId
        }
      });
    }
    if (messageRecord && files && files.length > 0) {
      await Promise.all(
        files.map(
          (file) => prisma2.file.create({
            data: {
              name: file.name,
              type: file.type,
              base64: file.base64,
              messageId: messageRecord.id
            }
          })
        )
      );
    }
    const msgCount = await prisma2.message.count({ where: { sessionId } });
    if (msgCount === 1 && prompt) {
      const summary = prompt.length > 40 ? prompt.slice(0, 37) + "..." : prompt;
      await prisma2.chatSession.update({
        where: { id: sessionId },
        data: { title: summary }
      });
    }
    await prisma2.message.create({
      data: {
        content: aiResponse,
        role: "assistant",
        sessionId
      }
    });
    const responseData = {
      response: aiResponse,
      role: "assistant",
      isAIResponse: true
    };
    return responseData;
  } catch (error) {
    console.error("Chat API Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: {
        message: error instanceof Error ? error.message : "Unknown error"
      }
    });
  } finally {
    if (prisma2) {
      await prisma2.$disconnect();
    }
  }
});

export { chat_post as default };
//# sourceMappingURL=chat.post.mjs.map

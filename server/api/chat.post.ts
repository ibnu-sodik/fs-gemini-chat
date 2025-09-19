import { GoogleGenAI } from "@google/genai";
import { defineEventHandler, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw createError({ statusCode: 500, message: "Missing GOOGLE_API_KEY" });
  }

  // Inisialisasi PrismaClient
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const { prompt, role, sessionId } = body;
  if (!prompt || !role || !sessionId)
    return { response: "", role: "assistant" };

  const aiResponse = `AI response for: ${prompt}`;

  await prisma.message.create({
    data: {
      content: prompt,
      role: "user",
      sessionId,
    },
  });

  await prisma.message.create({
    data: {
      content: aiResponse,
      role: "assistant",
      sessionId,
    },
  });

  return { response: aiResponse, role: "assistant" };
});

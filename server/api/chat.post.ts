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

  // Ambil userId dari session
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });
  const userId = session?.userId || null;

  // Kirim prompt ke Google Gemini
  let aiResponse = "";
  try {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash", // atau model lain sesuai kebutuhan
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    aiResponse = "[Error memanggil Gemini]";
  }

  // Simpan pesan user ke database
  await prisma.message.create({
    data: {
      content: prompt,
      role: "user",
      sessionId,
    },
  });

  // Jika pesan pertama, update kolom title ChatSession
  const msgCount = await prisma.message.count({ where: { sessionId } });
  if (msgCount === 1) {
    const summary = prompt.length > 40 ? prompt.slice(0, 37) + "..." : prompt;
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: summary },
    });
  }

  // Simpan pesan balasan Gemini ke database
  await prisma.message.create({
    data: {
      content: aiResponse,
      role: "assistant",
      sessionId,
    },
  });

  return { response: aiResponse, role: "assistant" };
});

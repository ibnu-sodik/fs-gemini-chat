import { GoogleGenAI } from "@google/genai";
import { defineEventHandler, readBody } from "h3";

interface FileData {
  name: string;
  type: string;
  base64: string;
}

interface ContentPart {
  text: string;
}

interface Content {
  role: string;
  parts: ContentPart[];
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Request received:", body); // Log permintaan untuk debugging

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw createError({ statusCode: 500, message: "Missing GOOGLE_API_KEY" });
  }

  // Inisialisasi PrismaClient
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const { prompt, role, sessionId, model, files } = body;
  if ((!prompt && (!files || files.length === 0)) || !role || !sessionId) {
    return { response: "", role: "assistant" };
  }

  // Ambil userId dari session
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });
  const userId = session?.userId || null;

  // Kirim prompt dan file ke Google Gemini
  let aiResponse = "";
  try {
    const genAI = new GoogleGenAI({ apiKey });

    const contents: Content[] = [{ role: "user", parts: [] }];

    if (prompt) {
      contents[0].parts.push({ text: prompt });
    }

    if (files && files.length > 0) {
      (files as FileData[]).forEach((file) => {
        contents[0].parts.push({
          text: `File: ${file.name}\nType: ${file.type}\nContent: ${file.base64}`,
        });
      });
    }

    const result = await genAI.models.generateContent({
      model: model,
      contents,
    });

    aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    aiResponse = "[Error memanggil Gemini]";
  }

  // Simpan pesan user ke database
  if (prompt) {
    await prisma.message.create({
      data: {
        content: prompt,
        role: "user",
        sessionId,
      },
    });
  }

  // Jika pesan pertama, update kolom title ChatSession
  const msgCount = await prisma.message.count({ where: { sessionId } });
  if (msgCount === 1 && prompt) {
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

  return { response: aiResponse, role: "assistant", isAIResponse: true };
});

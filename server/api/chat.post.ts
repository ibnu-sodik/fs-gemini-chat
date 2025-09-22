import { GoogleGenAI } from "@google/genai";
import { defineEventHandler, readBody, createError } from "h3";

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
  let prisma: any = null;

  try {
    const body = await readBody(event);

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw createError({ statusCode: 500, message: "Missing GOOGLE_API_KEY" });
    }

    // Inisialisasi PrismaClient
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();

    const { prompt, message, role, sessionId, model, files } = body;

    // Use prompt or message field
    const userMessage = prompt || message;

    if ((!userMessage && (!files || files.length === 0)) || !sessionId) {
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

      if (userMessage) {
        contents[0].parts.push({ text: userMessage });
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
      console.error("Gemini API Error:", err);
      aiResponse = "[Error memanggil Gemini]";
    }

    // Simpan pesan user ke database
    let messageRecord = null;
    if (userMessage || (files && files.length > 0)) {
      messageRecord = await prisma.message.create({
        data: {
          content: userMessage || "[File only]",
          role: "user",
          sessionId,
        },
      });
    }

    // Simpan file ke tabel File dengan relasi ke pesan
    if (messageRecord && files && files.length > 0) {
      await Promise.all(
        files.map((file: FileData) =>
          prisma.file.create({
            data: {
              name: file.name,
              type: file.type,
              base64: file.base64,
              messageId: messageRecord.id,
            },
          })
        )
      );
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

    const responseData = {
      response: aiResponse,
      role: "assistant",
      isAIResponse: true,
    };
    return responseData;
  } catch (error) {
    console.error("Chat API Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
  } finally {
    // Pastikan prisma connection ditutup
    if (prisma) {
      await prisma.$disconnect();
    }
  }
});

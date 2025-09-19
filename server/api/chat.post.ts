import { GoogleGenAI } from "@google/genai";
import { defineEventHandler, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw createError({ statusCode: 500, message: "Missing GOOGLE_API_KEY" });
  }

  const genAI = new GoogleGenAI({ apiKey });
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: body.prompt,
  });

  // Cek struktur response
  return { response: result?.candidates?.[0]?.content?.parts?.[0]?.text || "" };
});

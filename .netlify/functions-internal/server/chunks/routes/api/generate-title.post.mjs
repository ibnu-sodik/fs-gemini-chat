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

const generateTitle_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  try {
    const { message, model } = await readBody(event);
    if (!message || typeof message !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "Message is required"
      });
    }
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw createError({ statusCode: 500, message: "Missing GOOGLE_API_KEY" });
    }
    const genAI = new GoogleGenAI({ apiKey });
    const selectedModel = model || "gemini-1.5-flash";
    const prompt = `Based on this user message, create a short, relevant title (max 5-7 words in the same language as the message):

"${message.trim()}"

Requirements:
- Keep it concise and descriptive
- Remove unnecessary words like "please", "can you", "tolong", "bisa", etc.
- Focus on the main topic or question
- Use the same language as the input message
- Return only the title, nothing else

Examples:
"Tuliskan sejarah kerajaan Majapahit" \u2192 "Sejarah Kerajaan Majapahit"
"How to cook pasta properly?" \u2192 "How to Cook Pasta"
"Explain quantum physics to me" \u2192 "Quantum Physics Explanation"
"Buatkan kode Python untuk sorting" \u2192 "Kode Python Sorting"
"What is machine learning?" \u2192 "Machine Learning Overview"

Title:`;
    const contents = [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ];
    const result = await genAI.models.generateContent({
      model: selectedModel,
      contents
    });
    let title = ((_e = (_d = (_c = (_b = (_a = result == null ? void 0 : result.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) == null ? void 0 : _d[0]) == null ? void 0 : _e.text) || "";
    title = title.replace(/^["']|["']$/g, "");
    title = title.replace(/^Title:\s*/i, "");
    title = title.trim();
    if (!title || title.length > 50) {
      const words = message.trim().split(" ");
      title = words.slice(0, 5).join(" ");
      if (title.length > 30) {
        title = title.slice(0, 30) + "...";
      }
    }
    return {
      title: title || "New Chat"
    };
  } catch (error) {
    console.error("Title generation error:", error);
    try {
      const { message } = await readBody(event);
      if (message) {
        const words = message.trim().split(" ");
        const fallbackTitle = words.slice(0, 5).join(" ");
        return {
          title: fallbackTitle.length > 30 ? fallbackTitle.slice(0, 30) + "..." : fallbackTitle
        };
      }
    } catch (fallbackError) {
      console.error("Fallback title generation error:", fallbackError);
    }
    return { title: "New Chat" };
  }
});

export { generateTitle_post as default };
//# sourceMappingURL=generate-title.post.mjs.map

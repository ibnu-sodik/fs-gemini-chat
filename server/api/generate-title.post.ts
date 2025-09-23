import { GoogleGenAI } from "@google/genai";
import { defineEventHandler, readBody, createError } from "h3";

interface ContentPart {
  text: string;
}

interface Content {
  role: string;
  parts: ContentPart[];
}

export default defineEventHandler(async (event) => {
  try {
    const { message, model } = await readBody(event);

    if (!message || typeof message !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "Message is required",
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw createError({ statusCode: 500, message: "Missing GOOGLE_API_KEY" });
    }

    const genAI = new GoogleGenAI({ apiKey });
    const selectedModel = model || "gemini-1.5-flash"; // fallback ke gemini-1.5-flash

    const prompt = `Based on this user message, create a short, relevant title (max 5-7 words in the same language as the message):

"${message.trim()}"

Requirements:
- Keep it concise and descriptive
- Remove unnecessary words like "please", "can you", "tolong", "bisa", etc.
- Focus on the main topic or question
- Use the same language as the input message
- Return only the title, nothing else

Examples:
"Tuliskan sejarah kerajaan Majapahit" → "Sejarah Kerajaan Majapahit"
"How to cook pasta properly?" → "How to Cook Pasta"
"Explain quantum physics to me" → "Quantum Physics Explanation"
"Buatkan kode Python untuk sorting" → "Kode Python Sorting"
"What is machine learning?" → "Machine Learning Overview"

Title:`;

    const contents: Content[] = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const result = await genAI.models.generateContent({
      model: selectedModel,
      contents,
    });

    let title = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean up the response - remove quotes and extra formatting
    title = title.replace(/^["']|["']$/g, "");
    title = title.replace(/^Title:\s*/i, "");
    title = title.trim();

    // Fallback if title is too long or empty
    if (!title || title.length > 50) {
      // Fallback to simple title generation
      const words = message.trim().split(" ");
      title = words.slice(0, 5).join(" ");
      if (title.length > 30) {
        title = title.slice(0, 30) + "...";
      }
    }

    return {
      title: title || "New Chat",
    };
  } catch (error) {
    console.error("Title generation error:", error);

    // Fallback: simple title from first few words
    try {
      const { message } = await readBody(event);
      if (message) {
        const words = message.trim().split(" ");
        const fallbackTitle = words.slice(0, 5).join(" ");
        return {
          title:
            fallbackTitle.length > 30
              ? fallbackTitle.slice(0, 30) + "..."
              : fallbackTitle,
        };
      }
    } catch (fallbackError) {
      console.error("Fallback title generation error:", fallbackError);
    }

    return { title: "New Chat" };
  }
});

import { defineEventHandler, readBody } from "h3";
import axios from "axios";

export default defineEventHandler(async (event) => {
  // Terima file audio base64 dari frontend
  const body = await readBody(event);
  const { audioBase64 } = body;
  if (!audioBase64) return { text: "" };

  // Pilih provider: GOOGLE atau OPENAI
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // Jika ada GOOGLE_API_KEY, gunakan Gemini Speech-to-Text
  if (GOOGLE_API_KEY) {
    try {
      // Kirim audio ke Gemini Speech-to-Text
      // Endpoint Gemini: https://generativelanguage.googleapis.com/v1beta/models/speech-to-text:analyze
      // Dokumentasi: https://ai.google.dev/docs/speech-to-text
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/speech-to-text:analyze?key=" +
          GOOGLE_API_KEY,
        {
          config: {
            languageCode: "id-ID", // ganti sesuai kebutuhan
          },
          audio: {
            content: audioBase64.split(",")[1], // buang prefix data:audio/xxx;base64,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Gemini response: { results: [{ transcript: "..." }] }
      const transcript = response.data?.results?.[0]?.transcript || "";
      return { text: transcript };
    } catch (err) {
      return { text: "[Gagal transkripsi audio Google]" };
    }
  }

  // Jika tidak ada GOOGLE_API_KEY, fallback ke OpenAI Whisper
  if (!OPENAI_API_KEY) return { text: "[API Key tidak tersedia]" };
  try {
    // Kirim audio ke OpenAI Whisper
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        file: audioBase64,
        model: "whisper-1",
        response_format: "text",
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { text: response.data.text };
  } catch (err) {
    return { text: "[Gagal transkripsi audio OpenAI]" };
  }
});

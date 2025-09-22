import { defineEventHandler, readBody } from "h3";

function decodeDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error("Format audio base64 tidak valid");
  const mime = match[1];
  const b64 = match[2];
  const buffer = Buffer.from(b64, "base64");
  return { mime, buffer };
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { audioBase64, languageCode } = body || {};
  if (!audioBase64) return { text: "" };

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return { text: "[OPENAI_API_KEY tidak tersedia]" };

  try {
    const { buffer, mime } = decodeDataUrl(audioBase64);
    const formData = new FormData();
    const fileName = "audio." + (mime.split("/")[1] || "webm");
    formData.append("file", new Blob([buffer], { type: mime }), fileName);
    formData.append("model", "whisper-1");
    if (languageCode) formData.append("language", languageCode);
    formData.append("response_format", "text");

    const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: formData as any,
    });
    if (!resp.ok) {
      const errTxt = await resp.text();
      return { text: `[Gagal transkripsi (${resp.status})] ${errTxt}` };
    }
    const text = await resp.text();
    return { text };
  } catch (e: any) {
    return { text: `[Gagal transkripsi OpenAI] ${e.message || e}` };
  }
});

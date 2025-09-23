import { d as defineEventHandler, r as readBody } from '../../_/nitro.mjs';
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

function decodeDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error("Format audio base64 tidak valid");
  const mime = match[1];
  const b64 = match[2];
  const buffer = Buffer.from(b64, "base64");
  return { mime, buffer };
}
const speech_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
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
      body: formData
    });
    if (!resp.ok) {
      const errTxt = await resp.text();
      let errorData;
      try {
        errorData = JSON.parse(errTxt);
      } catch {
        errorData = { message: errTxt };
      }
      event.node.res.statusCode = resp.status;
      return {
        error: {
          code: ((_a = errorData.error) == null ? void 0 : _a.code) || "api_error",
          message: ((_b = errorData.error) == null ? void 0 : _b.message) || `Gagal transkripsi (${resp.status}): ${errTxt}`,
          type: ((_c = errorData.error) == null ? void 0 : _c.type) || "transcription_error"
        }
      };
    }
    const text = await resp.text();
    return { text };
  } catch (e) {
    event.node.res.statusCode = 500;
    return {
      error: {
        code: "server_error",
        message: e.message || "Gagal transkripsi audio",
        type: "internal_error"
      }
    };
  }
});

export { speech_post as default };
//# sourceMappingURL=speech.post.mjs.map

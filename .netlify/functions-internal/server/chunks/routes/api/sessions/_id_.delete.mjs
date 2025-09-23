import { d as defineEventHandler, k as getRouterParam, c as createError, p as prisma } from '../../../_/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, "id");
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Session ID is required"
    });
  }
  try {
    await prisma.message.deleteMany({
      where: { sessionId }
    });
    await prisma.chatSession.delete({
      where: { id: sessionId }
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete session"
    });
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

import { d as defineEventHandler, k as getRouterParam, r as readBody, c as createError } from '../../../_/nitro.mjs';
import { PrismaClient } from '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@logto/node';
import '@silverhand/essentials';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const prisma = new PrismaClient();
const _id__put = defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, "id");
  const body = await readBody(event);
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Session ID is required"
    });
  }
  try {
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: body.title },
      select: { id: true, title: true }
    });
    return { session: updatedSession };
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Session not found"
    });
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map

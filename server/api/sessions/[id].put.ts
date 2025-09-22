import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody, getRouterParam } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Session ID is required",
    });
  }

  try {
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: body.title },
      select: { id: true, title: true },
    });

    return { session: updatedSession };
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: "Session not found",
    });
  }
});

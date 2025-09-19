import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getQuery } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { sessionId } = getQuery(event);
  if (!sessionId) return { messages: [] };

  const messages = await prisma.message.findMany({
    where: { sessionId: String(sessionId) },
    select: { id: true, role: true, content: true },
    orderBy: { createdAt: "asc" },
  });

  return { messages };
});

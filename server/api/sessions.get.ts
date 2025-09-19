import { PrismaClient } from "@prisma/client";
import { defineEventHandler } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Ambil user id dari .env
  const userId = process.env.HC_USER_ID;
  if (!userId) return { sessions: [] };

  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return { sessions };
});

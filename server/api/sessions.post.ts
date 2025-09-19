import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = process.env.HC_USER_ID;
  if (!userId) return { error: true, message: "User ID not found" };

  // Buat session baru
  const session = await prisma.chatSession.create({
    data: {
      userId,
      title: body.title || "New Chat",
    },
    select: { id: true, title: true },
  });

  return { session };
});

import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";
import { getAuthenticatedUserId } from "~/server/utils/auth";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Get authenticated user ID from session
    const userId = await getAuthenticatedUserId(event);
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized - Please login first",
      });
    }

    // Buat session baru
    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: body.title || "New Chat",
      },
      select: { id: true, title: true },
    });

    return { session };
  } catch (error) {
    console.error("Create session error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create session",
    });
  } finally {
    await prisma.$disconnect();
  }
});

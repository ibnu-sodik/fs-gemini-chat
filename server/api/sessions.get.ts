import { defineEventHandler } from "h3";
import { getAuthenticatedUserId } from "~/server/utils/auth";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user ID from session
    const userId = await getAuthenticatedUserId(event);
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized - Please login first",
      });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    });

    return { sessions };
  } catch (error: any) {
    console.error("Get sessions error:", error);
    if (error.statusCode === 401) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get sessions",
    });
  }
});

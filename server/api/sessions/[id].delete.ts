import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, "id");

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Session ID is required",
    });
  }

  try {
    // Delete all messages first (due to foreign key constraint)
    await prisma.message.deleteMany({
      where: { sessionId },
    });

    // Then delete the session
    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete session",
    });
  }
});

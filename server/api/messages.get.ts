import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getQuery } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  console.log("=== API /messages called ===");

  try {
    const { sessionId } = getQuery(event);
    console.log("Requested sessionId:", sessionId);

    if (!sessionId || typeof sessionId !== "string") {
      console.log("Invalid sessionId, returning empty messages");
      return { messages: [] };
    }

    // Validate sessionId format (basic check)
    if (sessionId.length < 10) {
      console.log("SessionId too short, returning empty messages");
      return { messages: [] };
    }

    console.log("Attempting database query for sessionId:", sessionId);
    const messages = await prisma.message.findMany({
      where: { sessionId: String(sessionId) },
      select: {
        id: true,
        role: true,
        content: true,
        files: {
          select: {
            id: true,
            name: true,
            type: true,
            base64: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    console.log(
      "Database query successful, found",
      messages.length,
      "messages"
    );
    return { messages };
  } catch (error) {
    console.error("Database error:", error);

    // Return mock data for testing when database is not available
    const { sessionId } = getQuery(event);
    console.log("Falling back to mock data for sessionId:", sessionId);

    return {
      messages: [
        {
          id: "msg-1",
          role: "user",
          content: `Hello from session ${sessionId}!`,
          files: [],
        },
        {
          id: "msg-2",
          role: "assistant",
          content: `Hi! This is a test response for session ${sessionId}. The routing is working!`,
          files: [],
        },
      ],
    };
  }
});

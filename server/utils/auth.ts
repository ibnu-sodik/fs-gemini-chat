import { PrismaClient } from "@prisma/client";
import type { H3Event } from "h3";

const prisma = new PrismaClient();

/**
 * Get authenticated user from session cookie
 * Returns user data from database or null if not authenticated
 */
export async function getAuthenticatedUser(event: H3Event) {
  try {
    const sessionCookie = getCookie(event, "logto-session");

    if (!sessionCookie) {
      return null;
    }

    // Decrypt session data
    let sessionData;
    try {
      sessionData = JSON.parse(
        Buffer.from(sessionCookie, "base64").toString("utf8")
      );
    } catch {
      return null;
    }

    // Check if session is expired
    if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
      return null;
    }

    // Get user from database
    if (sessionData.userId) {
      const user = await prisma.user.findUnique({
        where: { id: sessionData.userId },
      });
      return user;
    }

    return null;
  } catch (error) {
    console.error("Auth helper error:", error);
    return null;
  }
}

/**
 * Get authenticated user ID from session
 * Returns database user ID or null if not authenticated
 */
export async function getAuthenticatedUserId(
  event: H3Event
): Promise<string | null> {
  const user = await getAuthenticatedUser(event);
  return user?.id || null;
}

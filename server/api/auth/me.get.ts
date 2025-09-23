import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const sessionCookie = getCookie(event, "logto-session");

    if (!sessionCookie) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    // Decrypt session data (simple base64 for now)
    let sessionData;
    try {
      sessionData = JSON.parse(
        Buffer.from(sessionCookie, "base64").toString("utf8")
      );
    } catch {
      // Invalid session cookie
      deleteCookie(event, "logto-session");
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    // Check if session is expired
    if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
      deleteCookie(event, "logto-session");
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    // Get user from database using the database ID
    let dbUser = null;
    if (sessionData.userId) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { id: sessionData.userId },
        });
      } catch (error) {
        console.error("Database error:", error);
      }
    }

    // If user not found in database, try by logtoId as fallback
    if (!dbUser && sessionData.logtoId) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { logtoId: sessionData.logtoId },
        });
      } catch (error) {
        console.error("Database fallback error:", error);
      }
    }

    // If still no user found, create from session data
    if (!dbUser && sessionData.logtoId) {
      try {
        dbUser = await prisma.user.create({
          data: {
            logtoId: sessionData.logtoId,
            email: sessionData.email || "",
            name:
              sessionData.name || sessionData.email?.split("@")[0] || "User",
            avatar: sessionData.picture,
            lastLoginAt: new Date(),
            isActive: true,
          },
        });
        console.log("✅ User created from session data:", dbUser.email);
      } catch (error) {
        console.error("User creation error:", error);
      }
    }

    // Return user data from database or fallback to session
    const user = dbUser
      ? {
          id: dbUser.id,
          logtoId: dbUser.logtoId,
          email: dbUser.email,
          name: dbUser.name,
          picture: dbUser.avatar,
        }
      : {
          id: sessionData.userId,
          logtoId: sessionData.logtoId,
          email: sessionData.email,
          name: sessionData.name,
          picture: sessionData.picture,
        };

    return {
      user,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Auth me error:", error);
    return {
      user: null,
      isAuthenticated: false,
    };
  } finally {
    await prisma.$disconnect();
  }
});

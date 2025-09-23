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

    const user = {
      id: sessionData.userId,
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
  }
});

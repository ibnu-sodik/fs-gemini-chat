import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    // Read directly from environment variables, bypassing runtime config issues
    const logtoEndpoint = config.public.logtoEndpoint || process.env.NUXT_LOGTO_ENDPOINT || process.env.LOGTO_ENDPOINT;
    const logtoAppId = config.public.logtoAppId || process.env.NUXT_LOGTO_APP_ID || process.env.LOGTO_APP_ID;
    const logtoAppSecret = config.logtoAppSecret || process.env.NUXT_LOGTO_APP_SECRET || process.env.LOGTO_APP_SECRET;

    console.log('Callback - logtoEndpoint:', !!logtoEndpoint);
    console.log('Callback - logtoAppId:', !!logtoAppId);
    console.log('Callback - logtoAppSecret:', !!logtoAppSecret);

    if (!logtoEndpoint || !logtoAppId || !logtoAppSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: "Missing Logto configuration in callback",
      });
    }

    const body = await readBody(event);
    const { code, state } = body;

    if (!code) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing authorization code",
      });
    }

    // Exchange authorization code for access token
    interface TokenResponse {
      access_token: string;
      id_token: string;
      token_type: string;
      expires_in: number;
    }

    const tokenUrl = `${logtoEndpoint}/oidc/token`;
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: logtoAppId,
      client_secret: logtoAppSecret,
      code,
      redirect_uri: `${getRequestURL(event).origin}/auth/callback`,
    }).toString();

    const tokenResponse: TokenResponse = await $fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenBody,
    });

    if (!tokenResponse.access_token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to obtain access token",
      });
    }

    // Get user info using access token
    interface UserInfo {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    }

    const userInfoUrl = `${logtoEndpoint}/oidc/me`;
    const userInfo: UserInfo = await $fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
    });

    // Save/Update user in database
    const dbUser = await prisma.user.upsert({
      where: { logtoId: userInfo.sub },
      create: {
        logtoId: userInfo.sub,
        email: userInfo.email || "",
        name: userInfo.name || userInfo.email?.split("@")[0] || "User",
        avatar: userInfo.picture,
        lastLoginAt: new Date(),
        isActive: true,
      },
      update: {
        email: userInfo.email || "",
        name: userInfo.name || userInfo.email?.split("@")[0] || "User",
        avatar: userInfo.picture,
        lastLoginAt: new Date(),
      },
    });

    console.log("✅ User saved to database:", dbUser.email);

    // Set secure session cookie
    const sessionData = {
      userId: dbUser.id, // Use database ID instead of Logto ID
      logtoId: userInfo.sub,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.avatar,
      accessToken: tokenResponse.access_token,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    };

    // Encrypt session data (simple base64 for now, use proper encryption in production)
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString(
      "base64"
    );

    // Set HTTP-only cookie
    setCookie(event, "logto-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenResponse.expires_in,
    });

    return {
      success: true,
      user: {
        id: dbUser.id, // Database ID
        logtoId: userInfo.sub, // Logto ID
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.avatar,
      },
    };
  } catch (error) {
    console.error("Callback error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  } finally {
    await prisma.$disconnect();
  }
});
